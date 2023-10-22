import Gio from 'gi://Gio';
import {InjectionManager} from 'resource:///org/gnome/shell/extensions/extension.js';
const GioSSS = Gio.SettingsSchemaSource;


const _injectionManager = new InjectionManager();

export function overrideProto(proto, overrides) {
    const backup = {};

    for (var symbol in overrides) {
        if (symbol.startsWith('after_')) {
            const actualSymbol = symbol.slice('after_'.length);
            const fn = proto[actualSymbol];
            const afterFn = overrides[symbol]
            proto[actualSymbol] = function() {
                const args = Array.prototype.slice.call(arguments);
                const res = fn.apply(this, args);
                afterFn.apply(this, args);
                return res;
            };
            backup[actualSymbol] = fn;
        }
        else {
            backup[symbol] = proto[symbol];
            const override = overrides[symbol]
            if (symbol.startsWith('vfunc')) {
                this._injectionManager.overrideMethod(proto, 'vfunc_' + symbol,
                    (originalAllocate) => override);
            }
            else {
                proto[symbol] = overrides[symbol];
            }
        }
    }
    return backup;
}

export function bindSetting(label, callback, executeOnBind = true, getSettings) {
    let settings = global.vertical_overview.settings;
    if (!settings) {
        settings = global.vertical_overview.settings = {
            object: getSettings('org.gnome.shell.extensions.vertical-overview'),
            signals: {},
            callbacks: {}
        };
    }


    if (settings.signals[label])
        settings.object.disconnectObject(settings.signals[label]);

    const signal = global.vertical_overview.settings.object.connectObject('changed::' + label, callback);
    global.vertical_overview.settings.signals[label] = signal;
    settings.callbacks[label] = callback;

    if (executeOnBind) callback(settings.object, label);
    return signal;
}

export function unbindSetting(label, callback) {
    let settings = global.vertical_overview.settings;
    if (!settings || !settings.signals[label])
        return;

    if (callback)
        callback(settings.object, label);

    settings.object.disconnectObject(settings.signals[label]);
    delete settings.signals[label];

    if (settings.callbacks[label]) {
        delete settings.callbacks[label];
    }
}
