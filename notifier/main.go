package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"runtime"
	"runtime/pprof"
	"sync"
	"syscall"
	"time"

	"github.com/safing/portbase/modules"

	"github.com/safing/portbase/api/client"
	"github.com/safing/portbase/info"
	"github.com/safing/portbase/log"
)

var (
	dataDir          string
	databaseDir      string
	printStackOnExit bool
	showVersion      bool

	apiClient = client.NewClient("127.0.0.1:817")

	mainCtx, cancelMainCtx = context.WithCancel(context.Background())
	mainWg                 = &sync.WaitGroup{}
)

func init() {
	flag.StringVar(&dataDir, "data", "", "set data directory")
	flag.StringVar(&databaseDir, "db", "", "alias to --data (deprecated)")
	flag.BoolVar(&printStackOnExit, "print-stack-on-exit", false, "prints the stack before of shutting down")
	flag.BoolVar(&showVersion, "version", false, "show version and exit")

	runtime.GOMAXPROCS(2)
}

func main() {
	// parse flags
	flag.Parse()

	// set meta info
	info.Set("Portmaster Notifier", "0.1.7", "GPLv3", false)

	// check if meta info is ok
	err := info.CheckVersion()
	if err != nil {
		fmt.Println("compile error: please compile using the provided build script")
		os.Exit(1)
	}

	// print help
	if modules.HelpFlag {
		flag.Usage()
		os.Exit(0)
	}

	if showVersion {
		fmt.Println(info.FullVersion())
		os.Exit(0)
	}

	// backwards compatibility
	if dataDir == "" {
		dataDir = databaseDir
	}

	// check data dir
	if dataDir == "" {
		fmt.Fprintln(os.Stderr, "please set the data directory using --data=/path/to/data/dir")
		os.Exit(1)
	}

	// backwards compatibility
	databaseDir = dataDir

	// start log writer
	err = log.Start()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to start logging: %s\n", err)
		os.Exit(1)
	}

	// connect to API
	go apiClient.StayConnected()

	// start subsystems
	go tray()
	go statusClient()
	go notifClient()
	go configClient()

	// Shutdown
	// catch interrupt for clean shutdown
	signalCh := make(chan os.Signal, 1)
	signal.Notify(
		signalCh,
		os.Interrupt,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT,
	)

	// wait for shutdown
	select {
	case <-signalCh:
		fmt.Println(" <INTERRUPT>")
		log.Warning("program was interrupted, shutting down")
	case <-mainCtx.Done():
		log.Warning("program is shutting down")
	}

	if printStackOnExit {
		fmt.Println("=== PRINTING STACK ===")
		_ = pprof.Lookup("goroutine").WriteTo(os.Stdout, 2)
		fmt.Println("=== END STACK ===")
	}
	go func() {
		time.Sleep(10 * time.Second)
		fmt.Println("===== TAKING TOO LONG FOR SHUTDOWN - PRINTING STACK TRACES =====")
		_ = pprof.Lookup("goroutine").WriteTo(os.Stdout, 2)
		os.Exit(1)
	}()

	// clear all notifications
	clearNotifications()

	// shutdown
	cancelMainCtx()
	mainWg.Wait()

	apiClient.Shutdown()
	exitTray()
	log.Shutdown()

	os.Exit(0)
}
