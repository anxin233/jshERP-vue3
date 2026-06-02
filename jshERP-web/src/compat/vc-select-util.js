// Fork of ant-design-vue/es/vc-select/util.js — Vue 3 compat: read vnode.props / vnode.children
import _typeof from 'babel-runtime/helpers/typeof';
import { getPropsData, getSlotOptions, getKey, getAttrs, getComponentFromProp } from 'ant-design-vue/es/_util/props-util';
import { cloneVNodes } from 'ant-design-vue/es/_util/vnode';

function getSelectOptionProps(child) {
  if (!child) {
    return {};
  }
  if (child.props && Object.keys(child.props).length) {
    return child.props;
  }
  return getPropsData(child) || {};
}

function normalizeVnodeChildrenToLabel(children) {
  if (!children) {
    return '';
  }
  if (typeof children === 'string') {
    return children;
  }
  if (!Array.isArray(children)) {
    return String(children);
  }
  return children.map(function (node) {
    if (node == null) {
      return '';
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node);
    }
    if (node.__v_isVNode) {
      if (typeof node.children === 'string') {
        return node.children;
      }
      if (Array.isArray(node.children)) {
        return normalizeVnodeChildrenToLabel(node.children);
      }
      if (node.text != null) {
        return String(node.text);
      }
    }
    if (node.text != null) {
      return String(node.text);
    }
    if (node.children != null) {
      return normalizeVnodeChildrenToLabel(node.children);
    }
    return '';
  }).join('');
}

function getVnodeChildrenAsVNodes(child) {
  if (child.$slots && child.$slots['default']) {
    return cloneVNodes(child.$slots['default'], true);
  }
  if (child.__v_isVNode) {
    if (typeof child.children === 'string') {
      return [{ text: child.children }];
    }
    if (Array.isArray(child.children)) {
      return child.children;
    }
    if (child.componentOptions && child.componentOptions.children) {
      return cloneVNodes(child.componentOptions.children, true);
    }
    return [];
  }
  if (child.componentOptions && child.componentOptions.children) {
    return cloneVNodes(child.componentOptions.children, true);
  }
  return [];
}

export function toTitle(title) {
  if (typeof title === 'string') {
    return title.trim();
  }
  return '';
}
export function getValuePropValue(child) {
  if (!child) {
    return null;
  }
  var props = getSelectOptionProps(child);
  if ('value' in props) {
    return props.value;
  }
  if (getKey(child) !== undefined) {
    return getKey(child);
  }
  if (getSlotOptions(child).isSelectOptGroup) {
    var label = getComponentFromProp(child, 'label');
    if (label) {
      return label;
    }
  }
  throw new Error('Need at least a key or a value or a label (only for OptGroup) for ' + child);
}

export function getPropValue(child, prop) {
  if (prop === 'value') {
    return getValuePropValue(child);
  }
  if (prop === 'children') {
    var newChild = getVnodeChildrenAsVNodes(child);
    if (newChild.length === 1 && !newChild[0].tag) {
      return newChild[0].text;
    }
    if (newChild.length === 1 && newChild[0].__v_isVNode && typeof newChild[0].children === 'string') {
      return newChild[0].children;
    }
    if (child.__v_isVNode && (typeof child.children === 'string' || Array.isArray(child.children))) {
      var label = normalizeVnodeChildrenToLabel(child.children);
      if (label) {
        return label;
      }
    }
    return newChild;
  }
  var data = getSelectOptionProps(child);
  if (prop in data) {
    return data[prop];
  } else {
    return getAttrs(child)[prop];
  }
}

export function isMultiple(props) {
  return props.multiple;
}

export function isCombobox(props) {
  return props.combobox;
}

export function isMultipleOrTags(props) {
  return props.multiple || props.tags;
}

export function isMultipleOrTagsOrCombobox(props) {
  return isMultipleOrTags(props) || isCombobox(props);
}

export function isSingleMode(props) {
  return !isMultipleOrTagsOrCombobox(props);
}

export function toArray(value) {
  var ret = value;
  if (value === undefined) {
    ret = [];
  } else if (!Array.isArray(value)) {
    ret = [value];
  }
  return ret;
}

export function getMapKey(value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '-' + value;
}

export function preventDefaultEvent(e) {
  e.preventDefault();
}

export function findIndexInValueBySingleValue(value, singleValue) {
  var index = -1;
  if (value) {
    for (var i = 0; i < value.length; i++) {
      if (value[i] === singleValue) {
        index = i;
        break;
      }
    }
  }
  return index;
}

export function getLabelFromPropsValue(value, key) {
  var label = void 0;
  value = toArray(value);
  if (value) {
    for (var i = 0; i < value.length; i++) {
      if (value[i].key === key) {
        label = value[i].label;
        break;
      }
    }
  }
  return label;
}

export function getSelectKeys(menuItems, value) {
  if (value === null || value === undefined) {
    return [];
  }
  var selectedKeys = [];
  menuItems.forEach(function (item) {
    if (getSlotOptions(item).isMenuItemGroup) {
      selectedKeys = selectedKeys.concat(getSelectKeys(item.componentOptions.children, value));
    } else {
      var itemValue = getValuePropValue(item);
      var itemKey = item.key;
      if (findIndexInValueBySingleValue(value, itemValue) !== -1 && itemKey !== undefined) {
        selectedKeys.push(itemKey);
      }
    }
  });
  return selectedKeys;
}

export var UNSELECTABLE_STYLE = {
  userSelect: 'none',
  WebkitUserSelect: 'none'
};

export var UNSELECTABLE_ATTRIBUTE = {
  unselectable: 'on'
};

export function findFirstMenuItem(children) {
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var props = getSelectOptionProps(child);
    if (getSlotOptions(child).isMenuItemGroup) {
      var groupChildren = child.componentOptions && child.componentOptions.children;
      if (!groupChildren && child.__v_isVNode && Array.isArray(child.children)) {
        groupChildren = child.children;
      }
      var found = findFirstMenuItem(groupChildren || []);
      if (found) {
        return found;
      }
    } else if (!props.disabled) {
      return child;
    }
  }
  return null;
}

export function includesSeparators(str, separators) {
  for (var i = 0; i < separators.length; ++i) {
    if (str.lastIndexOf(separators[i]) > 0) {
      return true;
    }
  }
  return false;
}

export function splitBySeparators(str, separators) {
  var reg = new RegExp('[' + separators.join() + ']');
  return str.split(reg).filter(function (token) {
    return token;
  });
}

export function defaultFilterFn(input, child) {
  var props = getSelectOptionProps(child);
  if (props.disabled) {
    return false;
  }
  var value = getPropValue(child, this.optionFilterProp);
  if (value.length && value[0].text) {
    value = value[0].text;
  } else {
    value = String(value);
  }
  return value.toLowerCase().indexOf(input.toLowerCase()) > -1;
}

export function validateOptionValue(value, props) {
  if (isSingleMode(props) || isMultiple(props)) {
    return;
  }
  if (typeof value !== 'string') {
    throw new Error('Invalid `value` of type `' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)) + '` supplied to Option, ' + 'expected `string` when `tags/combobox` is `true`.');
  }
}

export function saveRef(instance, name) {
  return function (node) {
    instance[name] = node;
  };
}

export function generateUUID() {
  if (process.env.NODE_ENV === 'test') {
    return 'test-uuid';
  }
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x7 | 0x8).toString(16);
  });
  return uuid;
}
