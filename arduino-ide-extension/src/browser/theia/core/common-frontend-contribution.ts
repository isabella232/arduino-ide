import { injectable } from 'inversify';
import { MenuModelRegistry } from '@theia/core/lib/common/menu';
import {
  CommonFrontendContribution as TheiaCommonFrontendContribution,
  CommonCommands,
} from '@theia/core/lib/browser/common-frontend-contribution';
import { CommandRegistry } from '@theia/core/lib/common/command';

@injectable()
export class CommonFrontendContribution extends TheiaCommonFrontendContribution {
  registerCommands(commandRegistry: CommandRegistry): void {
    super.registerCommands(commandRegistry);

    for (const command of [
      CommonCommands.CONFIGURE_DISPLAY_LANGUAGE,
      CommonCommands.CLOSE_TAB,
      CommonCommands.CLOSE_SAVED_TABS,
      CommonCommands.CLOSE_OTHER_TABS,
      CommonCommands.CLOSE_ALL_TABS,
      CommonCommands.COLLAPSE_PANEL,
      CommonCommands.TOGGLE_MAXIMIZED,
      CommonCommands.PIN_TAB,
      CommonCommands.UNPIN_TAB,
    ]) {
      commandRegistry.unregisterCommand(command);
    }
  }

  registerMenus(registry: MenuModelRegistry): void {
    super.registerMenus(registry);
    for (const command of [
      CommonCommands.SAVE,
      CommonCommands.SAVE_ALL,
      CommonCommands.CUT,
      CommonCommands.COPY,
      CommonCommands.PASTE,
      CommonCommands.COPY_PATH,
      CommonCommands.FIND,
      CommonCommands.REPLACE,
      CommonCommands.AUTO_SAVE,
      CommonCommands.OPEN_PREFERENCES,
      CommonCommands.SELECT_ICON_THEME,
      CommonCommands.SELECT_COLOR_THEME,
      CommonCommands.ABOUT_COMMAND,
      CommonCommands.SAVE_WITHOUT_FORMATTING, // Patched for https://github.com/eclipse-theia/theia/pull/8877
    ]) {
      registry.unregisterMenuAction(command);
    }
  }
}
