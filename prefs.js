import VerticalWorkspaceExtension from './extension';

const __DEBUG__ = true;
const { GObject, Gtk } = imports.gi;
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import * as Util from './util.js';

const BuilderScope = GObject.registerClass({
    GTypeName: 'VerticalOverviewBuilderScope',
    Implements: [Gtk.BuilderScope],
}, class BuilderScope extends GObject.Object {
    _init() {
        super._init()
        this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.vertical-overview');
    }

    vfunc_create_closure(builder, handlerName, flags, connectObject) {
        if (flags & Gtk.BuilderClosureFlags.SWAPPED)
            throw new Error('Unsupported template signal flag "swapped"');

        if (typeof this[handlerName] === 'undefined')
            throw new Error(`${handlerName} is undefined`);

        return this[handlerName].bind(connectObject || this);
    }

    _onIntValueChanged(value) {
        let current = this.settings.get_int(value.name);
        if (value.value != current) {
            if (__DEBUG__) log('value-changed: ' + value.name + " -> " + value.value);
            this.settings.set_int(value.name, value.value);
        }
    }

    _onBoolValueChanged(value) {
        let current = this.settings.get_boolean(value.name);
        if (value.active != current) {
            if (__DEBUG__) log('value-changed: ' + value.name + " -> " + value.active);
            this.settings.set_boolean(value.name, value.active);
        }
    }
});

function init() { }

export default class VerticalWorkspacePreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        let builder = new Gtk.Builder();

        builder.set_scope(new BuilderScope());
        builder.set_translation_domain('gettext-domain');
        builder.add_from_file(Self.dir.get_path() + '/settings.ui');

        let settings = this.getSettings('org.gnome.shell.extensions.vertical-overview');
        for (let key of settings.list_keys()) {
            let obj = builder.get_object(key);
            let value = settings.get_value(key);
            switch (value.get_type_string()) {
                case "i": obj.set_property('value', value.get_int32()); break;
                case "b": obj.set_property('active', value.get_boolean()); break;
            }
        }

        window.add(builder.get_object('main_widget'));
    }

}
