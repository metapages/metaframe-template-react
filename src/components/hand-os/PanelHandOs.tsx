import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Box,
  HStack,
  Link,
  Tag,
  VStack,
} from '@chakra-ui/react';

import { ButtonSetBaselineQuaternion } from '../ButtonSetBaselineQuaternion';
import {
  AccelerometerButtons,
} from '../control-mechanisms/AccelerometerButtons';
import {
  Menu,
  MenuItemActionMenu,
  MenuItemActionUrl,
  MenuItemDefinition,
  MenuItemTypes,
  MenuModel,
  MenuModelCursor,
  TapDirection,
} from './MenuModel';

/**
 * The main panel for the HandOS
 *
 */
export const PanelHandOs: React.FC<{ superslides: MenuModel }> = ({
  superslides,
}) => {
  const [menu, setMenu] = useState<Menu>(superslides.root);
  const [menus, _] = useState<Menu[]>(
    Object.keys(superslides.menus).map((id) => superslides.menus[id])
  );
  const [menuItem, setMenuItem] = useState<MenuItemDefinition | undefined>();
  const [menuItems, setMenuItems] = useState<MenuItemDefinition[]>([]);
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();

  const onMenuItemSelect = useCallback(
    (index: number) => {
      console.log(`onMenuItemSelect(${index})`);
      const cursor = superslides.setMenuItemSelection(index);
      // console.log('update', update);
      setMenuItem(cursor.item);
      if (cursor.menu) {
        setMenu(cursor.menu);
      }
    },
    [menu, setMenuItem, superslides]
  );

  const onMenuDirection = useCallback(
    (direction: TapDirection | undefined) => {
      // console.log(`onMenuDirection(${direction})`);
      let change: MenuModelCursor | undefined;
      if (direction === "left") {
        change = superslides.onMenuLeft();
        setMenuItem(change.item);
        if (change.menu) {
          setMenu(change.menu);
        }
      } else if (direction === "right") {
        change = superslides.onMenuRight();
        setMenuItem(change.item);
        if (change.menu) {
          setMenu(change.menu);
        }
      } else if (direction === "forward") {
        change = superslides.onMenuForward();
        if (change.menu) {
          setMenu(change.menu);
        }
      } else if (direction === "back") {
        change = superslides.onMenuBack();
        if (change.menu) {
          setMenu(change.menu);
        }
      }
    },
    [menu, setMenuItem, superslides]
  );

  // const controller = menu  ? <RotaryConstantSpeedSwitchNoPhysics steps={menu.items.length} startStep={menu.state.selectedIndex || 0} setStep={onMenuItemSelect} /> : null;
  const controller = menu ? (
    <AccelerometerButtons onDirection={onMenuDirection} />
  ) : null;

  const onMenuSelect = useCallback(
    (menu: Menu) => {
      const { menu: newMenu, item: newMenuItem } = superslides.setMenu(menu.id);
      if (newMenu) {
        setMenu(newMenu);
      }
    },
    [menu, setMenu]
  );

  const onMenuClick = useCallback(() => {
    // console.log(`onMenuClick onMenuItemSelect(-1)`)
    onMenuItemSelect(-1);
  }, [onMenuItemSelect]);

  const onMenuItemClick = useCallback(() => {
    // console.log('onMenuItemClick', menuItem);
    if (!menuItem) {
      return;
    }
    if (menuItem.type === MenuItemTypes.menu) {
      const blob = menuItem.value as MenuItemActionMenu;
      const change: MenuModelCursor = superslides.setMenu(blob.menu);
      // console.log('change', change);
      if (change.menu) {
        setMenu(change.menu);
      }
    }
  }, [menuItem, superslides, setMenu]);

  // On new Menu, update the menuItems, and selected
  useEffect(() => {
    // console.log(`on new menu ${menu.id} superslides.getMenuItemSelected()=${superslides.getMenuItemSelected()?.id}`);
    setMenuItems(
      superslides.current.items.map((itemId) => superslides.menuItems[itemId])
    );
    setMenuItem(superslides.getMenuItemSelected());
  }, [menu, setMenuItems, setMenuItem, superslides]);

  // On new MenuItem
  useEffect(() => {
    let url: string | undefined = undefined;
    if (menuItem?.type === MenuItemTypes.url) {
      const blob = menuItem.value as MenuItemActionUrl;
      url = blob.url;
    }
    if (menuItem?.type === MenuItemTypes.menu) {
      const blob = menuItem.value as MenuItemActionMenu;
      url = blob.url;
    }
    setIframeUrl(url);
  }, [menuItem, menu]);

  // On new Superslides, update the menu
  useEffect(() => {
    setMenu(superslides.root);
  }, [superslides, setMenu]);

  return (
    <VStack align="flex-start">
      <ButtonSetBaselineQuaternion />
      {controller}
      <HStack>
        {menus.map((m, index) => (
          <VStack
            align="flex-start"
            key={index}
            borderColor={m.id === menu.id ? "blue" : undefined}
            onClick={m === menu ? () => onMenuClick : () => onMenuSelect(m)}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Tag>{m.name || m.id}</Tag>


          </VStack>
        ))}
      </HStack>
      <VStack align="flex-start">
        Projector URL: {menu.sendToSlideProjector ? <Link isExternal href={`https://slides-remote.glitch.me/#?channel=${new URL(menu.sendToSlideProjector).pathname.replace("/", "")}`}>{`https://slides-remote.glitch.me/#?channel=${new URL(menu.sendToSlideProjector).pathname.replace("/", "")}`}</Link> : null}
        </VStack>

      <HStack>
        {menuItems.map((item, index) => (
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor={menuItem?.id === item.id ? "red" : undefined}
            key={index}
            onClick={() => onMenuItemSelect(index)}
          >
            <Tag>{item.name || item.id}</Tag>

          </Box>
        ))}
      </HStack>

      <Box
        borderWidth="1px"
        borderRadius="lg"
        w="100%"
        h="500px"
        onClick={onMenuItemClick}
      >
        {iframeUrl ? <iframe src={iframeUrl} /> : null}
      </Box>
    </VStack>
  );
};
