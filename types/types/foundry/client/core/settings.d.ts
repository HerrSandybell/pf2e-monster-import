export {};

declare global {
    interface ClientSettingsData {
        default: unknown;
        name: string;
        scope: "world" | "client";
        hint?: string;
        config?: boolean;
        type?: NumberConstructor | StringConstructor | BooleanConstructor | ObjectConstructor | FunctionConstructor;
        range?: this["type"] extends NumberConstructor ? { min: number; max: number; step: number } : undefined;
        choices?: Record<string, string> | Record<number, string>;
        onChange?: (choice?: string) => void | Promise<void>;
    }

    interface SettingsMenuConstructor {
        new (object?: {}, options?: FormApplicationOptions): FormApplication;
        registerSettings(): void;
    }

    interface SettingsMenuData {
        name: string;
        label: string;
        hint: string;
        icon: string;
        type: SettingsMenuConstructor;
        restricted: boolean;
    }

    interface ClientSettingsStorage extends Map<string, Storage | WorldSettingsStorage> {
        get(key: "client"): Storage;
        get(key: "world"): WorldSettingsStorage;
    }

    /**
     * An abstract interface for defining setting storage patterns
     * Each setting is a key/value pair
     */
    class ClientSettings {
        /** An object of registered game settings for this scope */
        settings: ClientSettingsMap;

        /** Registered settings menus which trigger secondary applications */
        menus: Map<string, { type: SettingsMenuConstructor }>;

        /**
         * The storage interfaces used for persisting settings
         * Each storage interface shares the same API as window.localStorage
         */
        storage: ClientSettingsStorage;

        constructor(worldSettings: ClientSettingsData);

        /** Return a singleton instance of the Game Settings Configuration app */
        get sheet(): SettingsConfig;

        /**
         * Register a new game setting under this setting scope
         *
         * @param module   The namespace under which the setting is registered
         * @param key      The key name for the setting under the namespace module
         * @param data     Configuration for setting data
         *
         * @example
         * // Register a client setting
         * game.settings.register("myModule", "myClientSetting", {
         *   name: "Register a Module Setting with Choices",
         *   hint: "A description of the registered setting and its behavior.",
         *   scope: "client",     // This specifies a client-stored setting
         *   config: true,        // This specifies that the setting appears in the configuration view
         *   type: String,
         *   choices: {           // If choices are defined, the resulting setting will be a select menu
         *     "a": "Option A",
         *     "b": "Option B"
         *   },
         *   default: "a",        // The default value for the setting
         *   onChange: value => { // A callback function which triggers when the setting is changed
         *     console.log(value)
         *   }
         * });
         *
         * @example
         * // Register a world setting
         * game.settings.register("myModule", "myWorldSetting", {
         *   name: "Register a Module Setting with a Range slider",
         *   hint: "A description of the registered setting and its behavior.",
         *   scope: "world",      // This specifies a world-level setting
         *   config: true,        // This specifies that the setting appears in the configuration view
         *   type: Number,
         *   range: {             // If range is specified, the resulting setting will be a range slider
         *     min: 0,
         *     max: 100,
         *     step: 10
         *   }
         *   default: 50,         // The default value for the setting
         *   onChange: value => { // A callback function which triggers when the setting is changed
         *     console.log(value)
         *   }
         * });
         */
        register(module: string, key: string, data: ClientSettingsData): void;

        /**
         * Register a new sub-settings menu
         *
         * @param module   The namespace under which the menu is registered
         * @param key      The key name for the setting under the namespace module
         * @param data     Configuration for setting data
         *
         * @example
         * // Define a settings submenu which handles advanced configuration needs
         * game.settings.registerMenu("myModule", "mySettingsMenu", {
         *   name: "My Settings Submenu",
         *   label: "Settings Menu Label",      // The text label used in the button
         *   hint: "A description of what will occur in the submenu dialog.",
         *   icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
         *   type: MySubmenuApplicationClass,   // A FormApplication subclass which should be created
         *   restricted: true                   // Restrict this submenu to gamemaster only?
         * });
         */
        registerMenu(module: string, key: string, data: SettingsMenuData): void;

        /**
         * Get the value of a game setting for a certain module and setting key
         * @param module    The module namespace under which the setting is registered
         * @param key       The setting key to retrieve
         */
        get(module: "core", key: "compendiumConfiguration"): Record<string, { private: boolean; locked: boolean }>;
        get(module: "core", key: "rollMode"): typeof CONST.DICE_ROLL_MODES[keyof typeof CONST.DICE_ROLL_MODES];
        get(module: string, key: string): any;

        /**
         * Get the value of a game setting for a certain module and setting key
         * @param module    The module namespace under which the setting is registered
         * @param key   The setting key to retrieve
         * @param value The data to assign to the setting key
         */
        set(module: string, key: string, value: unknown): Promise<unknown>;

        /**
         * Update the setting storage with a new value
         * @param key
         * @param value
         */
        update(key: string, value: any): Promise<any>;
    }

    interface ClientSettings {
        get(module: "core", setting: "defaultToken"): foundry.data.PrototypeTokenSource;
    }

    interface ClientSettingsMap extends Map<string, ClientSettingsData> {
        get(key: "core.defaultToken"): ClientSettingsData & { default: PreCreate<foundry.data.PrototypeTokenSource> };
    }

    /** A simple interface for World settings storage which imitates the API provided by localStorage */
    class WorldSettingsStorage extends Map<string, unknown> {
        constructor(settings: object);

        getItem(key: string): string | null;

        setItem(key: string, value: unknown): void;
    }
}
