import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as SwipeTracker from './swipeTracker.js';

const USE_3_FINGER_SWIPES = false;

export function override() {
    if (USE_3_FINGER_SWIPES) {
        global.vertical_overview.swipeTracker = Main.overview._swipeTracker;
        global.vertical_overview.swipeTracker.enabled = false;

        const swipeTracker = new SwipeTracker.SwipeTracker(global.stage,
            Clutter.Orientation.VERTICAL,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            { allowDrag: false, allowScroll: false });
        swipeTracker.connectObject('begin', Main.overview._gestureBegin.bind(Main.overview));
        swipeTracker.connectObject('update', Main.overview._gestureUpdate.bind(Main.overview));
        swipeTracker.connectObject('end', Main.overview._gestureEnd.bind(Main.overview));
        Main.overview._swipeTracker = swipeTracker;
    } else {
        let workspacesDisplay = Main.overview._overview._controls._workspacesDisplay;
        global.vertical_overview.swipeTracker = workspacesDisplay._swipeTracker;
        global.vertical_overview.swipeTracker.enabled = false;

        const swipeTracker = new SwipeTracker.SwipeTracker(
            Main.layoutManager.overviewGroup,
            Clutter.Orientation.VERTICAL,
            Shell.ActionMode.OVERVIEW,
            { allowDrag: false });
        swipeTracker.allowLongSwipes = true;
        swipeTracker.connectObject('begin', workspacesDisplay._switchWorkspaceBegin.bind(workspacesDisplay));
        swipeTracker.connectObject('update', workspacesDisplay._switchWorkspaceUpdate.bind(workspacesDisplay));
        swipeTracker.connectObject('end', workspacesDisplay._switchWorkspaceEnd.bind(workspacesDisplay));
        workspacesDisplay._swipeTracker = swipeTracker;


        let workspaceAnimation = Main.wm._workspaceAnimation;
        global.vertical_overview.animationSwipeTracker = workspaceAnimation._swipeTracker;
        global.vertical_overview.animationSwipeTracker.enabled = false;

        const swipeTrackerAnimation = new SwipeTracker.SwipeTracker(global.stage,
            Clutter.Orientation.VERTICAL,
            Shell.ActionMode.NORMAL,
            { allowDrag: false });
        swipeTrackerAnimation.connectObject('begin', workspaceAnimation._switchWorkspaceBegin.bind(workspaceAnimation));
        swipeTrackerAnimation.connectObject('update', workspaceAnimation._switchWorkspaceUpdate.bind(workspaceAnimation));
        swipeTrackerAnimation.connectObject('end', workspaceAnimation._switchWorkspaceEnd.bind(workspaceAnimation));
        workspaceAnimation._swipeTracker = swipeTrackerAnimation;

        global.display.bind_property('compositor-modifiers',
            workspaceAnimation._swipeTracker, 'scroll-modifiers',
            GObject.BindingFlags.SYNC_CREATE);

    }
}

export function reset() {
    let withProperties = {}
    if (USE_3_FINGER_SWIPES) {
        withProperties.swipeTracker = Main.overview._swipeTracker;
        Main.overview._swipeTracker = global.vertical_overview.swipeTracker;
        swipeTracker.destroy();
        delete withProperties.swipeTracker;
        Main.overview._swipeTracker.enabled = true;
    } else {
        let workspacesDisplay = Main.overview._overview._controls._workspacesDisplay;
        withProperties.swipeTracker = workspacesDisplay._swipeTracker;
        workspacesDisplay._swipeTracker = global.vertical_overview.swipeTracker;
        swipeTracker.destroy();
        delete withProperties.swipeTracker;

        let workspaceAnimation = Main.wm._workspaceAnimation;
        withProperties.animationSwipeTracker = workspaceAnimation._swipeTracker;
        animationSwipeTracker.destroy();
        delete withProperties.animationSwipeTracker;

        workspaceAnimation._swipeTracker = global.vertical_overview.animationSwipeTracker;
        workspaceAnimation._swipeTracker.enabled = true;
    }

}
