/**
 * ExpertiseLevel defines all available expertise levels.
 */
export enum ExpertiseLevel {
    Normal = 0,
    Expert = 1,
    Developer = 2,
}

/**
 * Returns a string representation of the expertise level.
 * 
 * @param level The level to convert
 */
export function expirtiseLevelName(level: ExpertiseLevel): string {
    switch (level) {
        case ExpertiseLevel.Normal:
            return 'normal'
        case ExpertiseLevel.Expert:
            return 'expert'
        case ExpertiseLevel.Developer:
            return 'developer'
    }
}

/**
 * OptionType defines the type of an option as stored in
 * the backend. Note that ExternalOptionHint may be used
 * to request a different visual representation and edit
 * menu on a per-option basis.
 */
export enum OptionType {
    String = 1,
    StringArray = 2,
    Int = 3,
    Bool = 4,
}

/**
 * Converts an option type to it's string representation.
 * 
 * @param opt The option type to convert
 */
export function optionTypeName(opt: OptionType): string {
    switch (opt) {
        case OptionType.String:
            return 'string';
        case OptionType.StringArray:
            return '[]string';
        case OptionType.Int:
            return 'int'
        case OptionType.Bool:
            return 'bool'
    }
}

/**
 * ReleaseLevel defines the available release and maturity
 * levels.
 */
export enum ReleaseLevel {
    Stable = 0,
    Beta = 1,
    Experimental = 2,
}

/**
 * releaseLevelName returns a string representation of the
 * release level.
 * 
 * @args level The release level to convert.
 */
export function releaseLevelName(level: ReleaseLevel): string {
    switch (level) {
        case ReleaseLevel.Stable:
            return 'stable'
        case ReleaseLevel.Beta:
            return 'beta'
        case ReleaseLevel.Experimental:
            return 'experimental'
    }
}

/**
 * ExternalOptionHint tells the UI to use a different visual
 * representation and edit menu that the options value would
 * imply. 
 * 
 * @todo(ppacher): portmaster also uses "string list" but that
 *                 seems to be a no-op in the old UI.
 */
export enum ExternalOptionHint{
    SecurityLevel = 'security level',
    EndpointList = 'endpoint list',
    FilterList = 'filter list',
    DisableUpdates = 'disable updates',
}

/**
 * BaseSetting describes the general shape of a portbase config setting.
 */
export interface BaseSetting<T, O extends OptionType> {
    // Value is the value of a setting.
    Value?: T;
    // DefaultValue is the default value of a setting.
    DefaultValue: T;
    // Description is a short description.
    Description: string;
    // ExpertiseLevel defines the required expertise level for
    // this setting to show up.
    ExpertiseLevel: ExpertiseLevel;
    // ExternalOptType may contain a hint for the UI on how
    // to display this option.
    ExternalOptType: ExternalOptionHint;
    // Help may contain a longer help text for this option.
    Help: string;
    // Key is the database key.
    Key: string;
    // Name is the name of the option.
    Name: string;
    // OptType is the option's basic type.
    OptType: O;
    // Order defines a priority for ordering items on the UI.
    // @todo(ppacher): this may be deprecated....
    Order: number;
    // ReleaseLevel defines the release level of the feature 
    // or settings changed by this option.
    ReleaseLevel: ReleaseLevel;
    // RequiresRestart may be set to true if the service requires
    // a restart after this option has been changed.
    RequiresRestart?: boolean;
    // ValidateRegex defines the regex used to validate this option.
    // The regex is used in Golang but is expected to be valid in 
    // JavaScript as well.
    ValidationRegex: string;
}

export type IntSetting = BaseSetting<number, OptionType.Int>;
export type StringSetting = BaseSetting<string, OptionType.String>;
export type StringArraySetting = BaseSetting<string[], OptionType.StringArray>;
export type BoolSetting = BaseSetting<boolean, OptionType.Bool>;

/**
 * SettingValueType is used to infer the type of a settings from it's default value.
 * Use like this:
 * 
 *      validate<S extends Setting>(spec: S, value SettingValueType<S>) { ... }
 */
export type SettingValueType<S extends Setting> = S extends {DefaultValue: infer T} ? T : any;

export type Setting = IntSetting
                    | StringSetting
                    | StringArraySetting
                    | BoolSetting;
