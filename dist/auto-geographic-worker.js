#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/requires-port/index.js
var require_requires_port = __commonJS((exports, module) => {
  module.exports = function required(port, protocol) {
    protocol = protocol.split(":")[0];
    port = +port;
    if (!port)
      return false;
    switch (protocol) {
      case "http":
      case "ws":
        return port !== 80;
      case "https":
      case "wss":
        return port !== 443;
      case "ftp":
        return port !== 21;
      case "gopher":
        return port !== 70;
      case "file":
        return false;
    }
    return port !== 0;
  };
});

// node_modules/querystringify/index.js
var require_querystringify = __commonJS((exports) => {
  var has = Object.prototype.hasOwnProperty;
  var undef;
  function decode(input) {
    try {
      return decodeURIComponent(input.replace(/\+/g, " "));
    } catch (e) {
      return null;
    }
  }
  function encode(input) {
    try {
      return encodeURIComponent(input);
    } catch (e) {
      return null;
    }
  }
  function querystring(query) {
    var parser = /([^=?#&]+)=?([^&]*)/g, result = {}, part;
    while (part = parser.exec(query)) {
      var key = decode(part[1]), value = decode(part[2]);
      if (key === null || value === null || key in result)
        continue;
      result[key] = value;
    }
    return result;
  }
  function querystringify(obj, prefix) {
    prefix = prefix || "";
    var pairs = [], value, key;
    if (typeof prefix !== "string")
      prefix = "?";
    for (key in obj) {
      if (has.call(obj, key)) {
        value = obj[key];
        if (!value && (value === null || value === undef || isNaN(value))) {
          value = "";
        }
        key = encode(key);
        value = encode(value);
        if (key === null || value === null)
          continue;
        pairs.push(key + "=" + value);
      }
    }
    return pairs.length ? prefix + pairs.join("&") : "";
  }
  exports.stringify = querystringify;
  exports.parse = querystring;
});

// node_modules/url-parse/index.js
var require_url_parse = __commonJS((exports, module) => {
  var required = require_requires_port();
  var qs = require_querystringify();
  var controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/;
  var CRHTLF = /[\n\r\t]/g;
  var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
  var port = /:\d+$/;
  var protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i;
  var windowsDriveLetter = /^[a-zA-Z]:/;
  function trimLeft(str) {
    return (str ? str : "").toString().replace(controlOrWhitespace, "");
  }
  var rules = [
    ["#", "hash"],
    ["?", "query"],
    function sanitize(address, url) {
      return isSpecial(url.protocol) ? address.replace(/\\/g, "/") : address;
    },
    ["/", "pathname"],
    ["@", "auth", 1],
    [NaN, "host", undefined, 1, 1],
    [/:(\d*)$/, "port", undefined, 1],
    [NaN, "hostname", undefined, 1, 1]
  ];
  var ignore = { hash: 1, query: 1 };
  function lolcation(loc) {
    var globalVar;
    if (typeof window !== "undefined")
      globalVar = window;
    else if (typeof global !== "undefined")
      globalVar = global;
    else if (typeof self !== "undefined")
      globalVar = self;
    else
      globalVar = {};
    var location = globalVar.location || {};
    loc = loc || location;
    var finaldestination = {}, type = typeof loc, key;
    if (loc.protocol === "blob:") {
      finaldestination = new Url(unescape(loc.pathname), {});
    } else if (type === "string") {
      finaldestination = new Url(loc, {});
      for (key in ignore)
        delete finaldestination[key];
    } else if (type === "object") {
      for (key in loc) {
        if (key in ignore)
          continue;
        finaldestination[key] = loc[key];
      }
      if (finaldestination.slashes === undefined) {
        finaldestination.slashes = slashes.test(loc.href);
      }
    }
    return finaldestination;
  }
  function isSpecial(scheme) {
    return scheme === "file:" || scheme === "ftp:" || scheme === "http:" || scheme === "https:" || scheme === "ws:" || scheme === "wss:";
  }
  function extractProtocol(address, location) {
    address = trimLeft(address);
    address = address.replace(CRHTLF, "");
    location = location || {};
    var match = protocolre.exec(address);
    var protocol = match[1] ? match[1].toLowerCase() : "";
    var forwardSlashes = !!match[2];
    var otherSlashes = !!match[3];
    var slashesCount = 0;
    var rest;
    if (forwardSlashes) {
      if (otherSlashes) {
        rest = match[2] + match[3] + match[4];
        slashesCount = match[2].length + match[3].length;
      } else {
        rest = match[2] + match[4];
        slashesCount = match[2].length;
      }
    } else {
      if (otherSlashes) {
        rest = match[3] + match[4];
        slashesCount = match[3].length;
      } else {
        rest = match[4];
      }
    }
    if (protocol === "file:") {
      if (slashesCount >= 2) {
        rest = rest.slice(2);
      }
    } else if (isSpecial(protocol)) {
      rest = match[4];
    } else if (protocol) {
      if (forwardSlashes) {
        rest = rest.slice(2);
      }
    } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
      rest = match[4];
    }
    return {
      protocol,
      slashes: forwardSlashes || isSpecial(protocol),
      slashesCount,
      rest
    };
  }
  function resolve(relative, base) {
    if (relative === "")
      return base;
    var path = (base || "/").split("/").slice(0, -1).concat(relative.split("/")), i = path.length, last = path[i - 1], unshift = false, up = 0;
    while (i--) {
      if (path[i] === ".") {
        path.splice(i, 1);
      } else if (path[i] === "..") {
        path.splice(i, 1);
        up++;
      } else if (up) {
        if (i === 0)
          unshift = true;
        path.splice(i, 1);
        up--;
      }
    }
    if (unshift)
      path.unshift("");
    if (last === "." || last === "..")
      path.push("");
    return path.join("/");
  }
  function Url(address, location, parser) {
    address = trimLeft(address);
    address = address.replace(CRHTLF, "");
    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }
    var relative, extracted, parse, instruction, index, key, instructions = rules.slice(), type = typeof location, url = this, i = 0;
    if (type !== "object" && type !== "string") {
      parser = location;
      location = null;
    }
    if (parser && typeof parser !== "function")
      parser = qs.parse;
    location = lolcation(location);
    extracted = extractProtocol(address || "", location);
    relative = !extracted.protocol && !extracted.slashes;
    url.slashes = extracted.slashes || relative && location.slashes;
    url.protocol = extracted.protocol || location.protocol || "";
    address = extracted.rest;
    if (extracted.protocol === "file:" && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
      instructions[3] = [/(.*)/, "pathname"];
    }
    for (;i < instructions.length; i++) {
      instruction = instructions[i];
      if (typeof instruction === "function") {
        address = instruction(address, url);
        continue;
      }
      parse = instruction[0];
      key = instruction[1];
      if (parse !== parse) {
        url[key] = address;
      } else if (typeof parse === "string") {
        index = parse === "@" ? address.lastIndexOf(parse) : address.indexOf(parse);
        if (~index) {
          if (typeof instruction[2] === "number") {
            url[key] = address.slice(0, index);
            address = address.slice(index + instruction[2]);
          } else {
            url[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else if (index = parse.exec(address)) {
        url[key] = index[1];
        address = address.slice(0, index.index);
      }
      url[key] = url[key] || (relative && instruction[3] ? location[key] || "" : "");
      if (instruction[4])
        url[key] = url[key].toLowerCase();
    }
    if (parser)
      url.query = parser(url.query);
    if (relative && location.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location.pathname !== "")) {
      url.pathname = resolve(url.pathname, location.pathname);
    }
    if (url.pathname.charAt(0) !== "/" && isSpecial(url.protocol)) {
      url.pathname = "/" + url.pathname;
    }
    if (!required(url.port, url.protocol)) {
      url.host = url.hostname;
      url.port = "";
    }
    url.username = url.password = "";
    if (url.auth) {
      index = url.auth.indexOf(":");
      if (~index) {
        url.username = url.auth.slice(0, index);
        url.username = encodeURIComponent(decodeURIComponent(url.username));
        url.password = url.auth.slice(index + 1);
        url.password = encodeURIComponent(decodeURIComponent(url.password));
      } else {
        url.username = encodeURIComponent(decodeURIComponent(url.auth));
      }
      url.auth = url.password ? url.username + ":" + url.password : url.username;
    }
    url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
    url.href = url.toString();
  }
  function set(part, value, fn) {
    var url = this;
    switch (part) {
      case "query":
        if (typeof value === "string" && value.length) {
          value = (fn || qs.parse)(value);
        }
        url[part] = value;
        break;
      case "port":
        url[part] = value;
        if (!required(value, url.protocol)) {
          url.host = url.hostname;
          url[part] = "";
        } else if (value) {
          url.host = url.hostname + ":" + value;
        }
        break;
      case "hostname":
        url[part] = value;
        if (url.port)
          value += ":" + url.port;
        url.host = value;
        break;
      case "host":
        url[part] = value;
        if (port.test(value)) {
          value = value.split(":");
          url.port = value.pop();
          url.hostname = value.join(":");
        } else {
          url.hostname = value;
          url.port = "";
        }
        break;
      case "protocol":
        url.protocol = value.toLowerCase();
        url.slashes = !fn;
        break;
      case "pathname":
      case "hash":
        if (value) {
          var char = part === "pathname" ? "/" : "#";
          url[part] = value.charAt(0) !== char ? char + value : value;
        } else {
          url[part] = value;
        }
        break;
      case "username":
      case "password":
        url[part] = encodeURIComponent(value);
        break;
      case "auth":
        var index = value.indexOf(":");
        if (~index) {
          url.username = value.slice(0, index);
          url.username = encodeURIComponent(decodeURIComponent(url.username));
          url.password = value.slice(index + 1);
          url.password = encodeURIComponent(decodeURIComponent(url.password));
        } else {
          url.username = encodeURIComponent(decodeURIComponent(value));
        }
    }
    for (var i = 0;i < rules.length; i++) {
      var ins = rules[i];
      if (ins[4])
        url[ins[1]] = url[ins[1]].toLowerCase();
    }
    url.auth = url.password ? url.username + ":" + url.password : url.username;
    url.origin = url.protocol !== "file:" && isSpecial(url.protocol) && url.host ? url.protocol + "//" + url.host : "null";
    url.href = url.toString();
    return url;
  }
  function toString(stringify) {
    if (!stringify || typeof stringify !== "function")
      stringify = qs.stringify;
    var query, url = this, host = url.host, protocol = url.protocol;
    if (protocol && protocol.charAt(protocol.length - 1) !== ":")
      protocol += ":";
    var result = protocol + (url.protocol && url.slashes || isSpecial(url.protocol) ? "//" : "");
    if (url.username) {
      result += url.username;
      if (url.password)
        result += ":" + url.password;
      result += "@";
    } else if (url.password) {
      result += ":" + url.password;
      result += "@";
    } else if (url.protocol !== "file:" && isSpecial(url.protocol) && !host && url.pathname !== "/") {
      result += "@";
    }
    if (host[host.length - 1] === ":" || port.test(url.hostname) && !url.port) {
      host += ":";
    }
    result += host + url.pathname;
    query = typeof url.query === "object" ? stringify(url.query) : url.query;
    if (query)
      result += query.charAt(0) !== "?" ? "?" + query : query;
    if (url.hash)
      result += url.hash;
    return result;
  }
  Url.prototype = { set, toString };
  Url.extractProtocol = extractProtocol;
  Url.location = lolcation;
  Url.trimLeft = trimLeft;
  Url.qs = qs;
  module.exports = Url;
});

// node_modules/buffer-more-ints/buffer-more-ints.js
var require_buffer_more_ints = __commonJS((exports, module) => {
  var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
  var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
  var MAX_INT = 9007199254740991;
  function isContiguousInt(val) {
    return val <= MAX_INT && val >= -MAX_INT;
  }
  function assertContiguousInt(val) {
    if (!isContiguousInt(val)) {
      throw new TypeError("number cannot be represented as a contiguous integer");
    }
  }
  exports.isContiguousInt = isContiguousInt;
  exports.assertContiguousInt = assertContiguousInt;
  ["UInt", "Int"].forEach(function(sign) {
    var suffix = sign + "8";
    exports["read" + suffix] = Buffer.prototype["read" + suffix].call;
    exports["write" + suffix] = Buffer.prototype["write" + suffix].call;
    ["16", "32"].forEach(function(size) {
      ["LE", "BE"].forEach(function(endian) {
        var suffix2 = sign + size + endian;
        var read = Buffer.prototype["read" + suffix2];
        exports["read" + suffix2] = function(buf, offset) {
          return read.call(buf, offset);
        };
        var write = Buffer.prototype["write" + suffix2];
        exports["write" + suffix2] = function(buf, val, offset) {
          return write.call(buf, val, offset);
        };
      });
    });
  });
  function check_value(val, min, max) {
    val = +val;
    if (typeof val != "number" || val < min || val > max || Math.floor(val) !== val) {
      throw new TypeError('"value" argument is out of bounds');
    }
    return val;
  }
  function check_bounds(buf, offset, len) {
    if (offset < 0 || offset + len > buf.length) {
      throw new RangeError("Index out of range");
    }
  }
  function readUInt24BE(buf, offset) {
    return buf.readUInt8(offset) << 16 | buf.readUInt16BE(offset + 1);
  }
  exports.readUInt24BE = readUInt24BE;
  function writeUInt24BE(buf, val, offset) {
    val = check_value(val, 0, 16777215);
    check_bounds(buf, offset, 3);
    buf.writeUInt8(val >>> 16, offset);
    buf.writeUInt16BE(val & 65535, offset + 1);
  }
  exports.writeUInt24BE = writeUInt24BE;
  function readUInt40BE(buf, offset) {
    return (buf.readUInt8(offset) || 0) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 1);
  }
  exports.readUInt40BE = readUInt40BE;
  function writeUInt40BE(buf, val, offset) {
    val = check_value(val, 0, 1099511627775);
    check_bounds(buf, offset, 5);
    buf.writeUInt8(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 1);
  }
  exports.writeUInt40BE = writeUInt40BE;
  function readUInt48BE(buf, offset) {
    return buf.readUInt16BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 2);
  }
  exports.readUInt48BE = readUInt48BE;
  function writeUInt48BE(buf, val, offset) {
    val = check_value(val, 0, 281474976710655);
    check_bounds(buf, offset, 6);
    buf.writeUInt16BE(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 2);
  }
  exports.writeUInt48BE = writeUInt48BE;
  function readUInt56BE(buf, offset) {
    return ((buf.readUInt8(offset) || 0) << 16 | buf.readUInt16BE(offset + 1)) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 3);
  }
  exports.readUInt56BE = readUInt56BE;
  function writeUInt56BE(buf, val, offset) {
    val = check_value(val, 0, 72057594037927940);
    check_bounds(buf, offset, 7);
    if (val < 72057594037927940) {
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeUInt8(hi >>> 16, offset);
      buf.writeUInt16BE(hi & 65535, offset + 1);
      buf.writeInt32BE(val & -1, offset + 3);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
    }
  }
  exports.writeUInt56BE = writeUInt56BE;
  function readUInt64BE(buf, offset) {
    return buf.readUInt32BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 4);
  }
  exports.readUInt64BE = readUInt64BE;
  function writeUInt64BE(buf, val, offset) {
    val = check_value(val, 0, 18446744073709552000);
    check_bounds(buf, offset, 8);
    if (val < 18446744073709552000) {
      buf.writeUInt32BE(Math.floor(val * SHIFT_RIGHT_32), offset);
      buf.writeInt32BE(val & -1, offset + 4);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 255;
    }
  }
  exports.writeUInt64BE = writeUInt64BE;
  function readUInt24LE(buf, offset) {
    return buf.readUInt8(offset + 2) << 16 | buf.readUInt16LE(offset);
  }
  exports.readUInt24LE = readUInt24LE;
  function writeUInt24LE(buf, val, offset) {
    val = check_value(val, 0, 16777215);
    check_bounds(buf, offset, 3);
    buf.writeUInt16LE(val & 65535, offset);
    buf.writeUInt8(val >>> 16, offset + 2);
  }
  exports.writeUInt24LE = writeUInt24LE;
  function readUInt40LE(buf, offset) {
    return (buf.readUInt8(offset + 4) || 0) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readUInt40LE = readUInt40LE;
  function writeUInt40LE(buf, val, offset) {
    val = check_value(val, 0, 1099511627775);
    check_bounds(buf, offset, 5);
    buf.writeInt32LE(val & -1, offset);
    buf.writeUInt8(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  exports.writeUInt40LE = writeUInt40LE;
  function readUInt48LE(buf, offset) {
    return buf.readUInt16LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readUInt48LE = readUInt48LE;
  function writeUInt48LE(buf, val, offset) {
    val = check_value(val, 0, 281474976710655);
    check_bounds(buf, offset, 6);
    buf.writeInt32LE(val & -1, offset);
    buf.writeUInt16LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  exports.writeUInt48LE = writeUInt48LE;
  function readUInt56LE(buf, offset) {
    return ((buf.readUInt8(offset + 6) || 0) << 16 | buf.readUInt16LE(offset + 4)) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readUInt56LE = readUInt56LE;
  function writeUInt56LE(buf, val, offset) {
    val = check_value(val, 0, 72057594037927940);
    check_bounds(buf, offset, 7);
    if (val < 72057594037927940) {
      buf.writeInt32LE(val & -1, offset);
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeUInt16LE(hi & 65535, offset + 4);
      buf.writeUInt8(hi >>> 16, offset + 6);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
    }
  }
  exports.writeUInt56LE = writeUInt56LE;
  function readUInt64LE(buf, offset) {
    return buf.readUInt32LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readUInt64LE = readUInt64LE;
  function writeUInt64LE(buf, val, offset) {
    val = check_value(val, 0, 18446744073709552000);
    check_bounds(buf, offset, 8);
    if (val < 18446744073709552000) {
      buf.writeInt32LE(val & -1, offset);
      buf.writeUInt32LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 255;
    }
  }
  exports.writeUInt64LE = writeUInt64LE;
  function readInt24BE(buf, offset) {
    return (buf.readInt8(offset) << 16) + buf.readUInt16BE(offset + 1);
  }
  exports.readInt24BE = readInt24BE;
  function writeInt24BE(buf, val, offset) {
    val = check_value(val, -8388608, 8388607);
    check_bounds(buf, offset, 3);
    buf.writeInt8(val >> 16, offset);
    buf.writeUInt16BE(val & 65535, offset + 1);
  }
  exports.writeInt24BE = writeInt24BE;
  function readInt40BE(buf, offset) {
    return (buf.readInt8(offset) || 0) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 1);
  }
  exports.readInt40BE = readInt40BE;
  function writeInt40BE(buf, val, offset) {
    val = check_value(val, -549755813888, 549755813887);
    check_bounds(buf, offset, 5);
    buf.writeInt8(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 1);
  }
  exports.writeInt40BE = writeInt40BE;
  function readInt48BE(buf, offset) {
    return buf.readInt16BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 2);
  }
  exports.readInt48BE = readInt48BE;
  function writeInt48BE(buf, val, offset) {
    val = check_value(val, -140737488355328, 140737488355327);
    check_bounds(buf, offset, 6);
    buf.writeInt16BE(Math.floor(val * SHIFT_RIGHT_32), offset);
    buf.writeInt32BE(val & -1, offset + 2);
  }
  exports.writeInt48BE = writeInt48BE;
  function readInt56BE(buf, offset) {
    return (((buf.readInt8(offset) || 0) << 16) + buf.readUInt16BE(offset + 1)) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 3);
  }
  exports.readInt56BE = readInt56BE;
  function writeInt56BE(buf, val, offset) {
    val = check_value(val, -576460752303423500, 36028797018963970);
    check_bounds(buf, offset, 7);
    if (val < 36028797018963970) {
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeInt8(hi >> 16, offset);
      buf.writeUInt16BE(hi & 65535, offset + 1);
      buf.writeInt32BE(val & -1, offset + 3);
    } else {
      buf[offset] = 127;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
    }
  }
  exports.writeInt56BE = writeInt56BE;
  function readInt64BE(buf, offset) {
    return buf.readInt32BE(offset) * SHIFT_LEFT_32 + buf.readUInt32BE(offset + 4);
  }
  exports.readInt64BE = readInt64BE;
  function writeInt64BE(buf, val, offset) {
    val = check_value(val, -2361183241434822600000, 9223372036854776000);
    check_bounds(buf, offset, 8);
    if (val < 9223372036854776000) {
      buf.writeInt32BE(Math.floor(val * SHIFT_RIGHT_32), offset);
      buf.writeInt32BE(val & -1, offset + 4);
    } else {
      buf[offset] = 127;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 255;
    }
  }
  exports.writeInt64BE = writeInt64BE;
  function readInt24LE(buf, offset) {
    return (buf.readInt8(offset + 2) << 16) + buf.readUInt16LE(offset);
  }
  exports.readInt24LE = readInt24LE;
  function writeInt24LE(buf, val, offset) {
    val = check_value(val, -8388608, 8388607);
    check_bounds(buf, offset, 3);
    buf.writeUInt16LE(val & 65535, offset);
    buf.writeInt8(val >> 16, offset + 2);
  }
  exports.writeInt24LE = writeInt24LE;
  function readInt40LE(buf, offset) {
    return (buf.readInt8(offset + 4) || 0) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readInt40LE = readInt40LE;
  function writeInt40LE(buf, val, offset) {
    val = check_value(val, -549755813888, 549755813887);
    check_bounds(buf, offset, 5);
    buf.writeInt32LE(val & -1, offset);
    buf.writeInt8(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  exports.writeInt40LE = writeInt40LE;
  function readInt48LE(buf, offset) {
    return buf.readInt16LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readInt48LE = readInt48LE;
  function writeInt48LE(buf, val, offset) {
    val = check_value(val, -140737488355328, 140737488355327);
    check_bounds(buf, offset, 6);
    buf.writeInt32LE(val & -1, offset);
    buf.writeInt16LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
  }
  exports.writeInt48LE = writeInt48LE;
  function readInt56LE(buf, offset) {
    return (((buf.readInt8(offset + 6) || 0) << 16) + buf.readUInt16LE(offset + 4)) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readInt56LE = readInt56LE;
  function writeInt56LE(buf, val, offset) {
    val = check_value(val, -36028797018963970, 36028797018963970);
    check_bounds(buf, offset, 7);
    if (val < 36028797018963970) {
      buf.writeInt32LE(val & -1, offset);
      var hi = Math.floor(val * SHIFT_RIGHT_32);
      buf.writeUInt16LE(hi & 65535, offset + 4);
      buf.writeInt8(hi >> 16, offset + 6);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 127;
    }
  }
  exports.writeInt56LE = writeInt56LE;
  function readInt64LE(buf, offset) {
    return buf.readInt32LE(offset + 4) * SHIFT_LEFT_32 + buf.readUInt32LE(offset);
  }
  exports.readInt64LE = readInt64LE;
  function writeInt64LE(buf, val, offset) {
    val = check_value(val, -9223372036854776000, 9223372036854776000);
    check_bounds(buf, offset, 8);
    if (val < 9223372036854776000) {
      buf.writeInt32LE(val & -1, offset);
      buf.writeInt32LE(Math.floor(val * SHIFT_RIGHT_32), offset + 4);
    } else {
      buf[offset] = 255;
      buf[offset + 1] = 255;
      buf[offset + 2] = 255;
      buf[offset + 3] = 255;
      buf[offset + 4] = 255;
      buf[offset + 5] = 255;
      buf[offset + 6] = 255;
      buf[offset + 7] = 127;
    }
  }
  exports.writeInt64LE = writeInt64LE;
});

// node_modules/amqplib/lib/codec.js
var require_codec = __commonJS((exports, module) => {
  var ints = require_buffer_more_ints();
  function isFloatingPoint(n) {
    return n >= 9223372036854776000 || Math.abs(n) < 1125899906842624 && Math.floor(n) !== n;
  }
  function encodeTable(buffer, val, offset) {
    var start = offset;
    offset += 4;
    for (var key in val) {
      if (val[key] !== undefined) {
        var len = Buffer.byteLength(key);
        buffer.writeUInt8(len, offset);
        offset++;
        buffer.write(key, offset, "utf8");
        offset += len;
        offset += encodeFieldValue(buffer, val[key], offset);
      }
    }
    var size = offset - start;
    buffer.writeUInt32BE(size - 4, start);
    return size;
  }
  function encodeArray(buffer, val, offset) {
    var start = offset;
    offset += 4;
    for (var i = 0, num = val.length;i < num; i++) {
      offset += encodeFieldValue(buffer, val[i], offset);
    }
    var size = offset - start;
    buffer.writeUInt32BE(size - 4, start);
    return size;
  }
  function encodeFieldValue(buffer, value, offset) {
    var start = offset;
    var type = typeof value, val = value;
    if (value && type === "object" && value.hasOwnProperty("!")) {
      val = value.value;
      type = value["!"];
    }
    if (type == "number") {
      if (isFloatingPoint(val)) {
        type = "double";
      } else {
        if (val < 128 && val >= -128) {
          type = "byte";
        } else if (val >= -32768 && val < 32768) {
          type = "short";
        } else if (val >= -2147483648 && val < 2147483648) {
          type = "int";
        } else {
          type = "long";
        }
      }
    }
    function tag(t) {
      buffer.write(t, offset);
      offset++;
    }
    switch (type) {
      case "string":
        var len = Buffer.byteLength(val, "utf8");
        tag("S");
        buffer.writeUInt32BE(len, offset);
        offset += 4;
        buffer.write(val, offset, "utf8");
        offset += len;
        break;
      case "object":
        if (val === null) {
          tag("V");
        } else if (Array.isArray(val)) {
          tag("A");
          offset += encodeArray(buffer, val, offset);
        } else if (Buffer.isBuffer(val)) {
          tag("x");
          buffer.writeUInt32BE(val.length, offset);
          offset += 4;
          val.copy(buffer, offset);
          offset += val.length;
        } else {
          tag("F");
          offset += encodeTable(buffer, val, offset);
        }
        break;
      case "boolean":
        tag("t");
        buffer.writeUInt8(val ? 1 : 0, offset);
        offset++;
        break;
      case "double":
      case "float64":
        tag("d");
        buffer.writeDoubleBE(val, offset);
        offset += 8;
        break;
      case "byte":
      case "int8":
        tag("b");
        buffer.writeInt8(val, offset);
        offset++;
        break;
      case "unsignedbyte":
      case "uint8":
        tag("B");
        buffer.writeUInt8(val, offset);
        offset++;
        break;
      case "short":
      case "int16":
        tag("s");
        buffer.writeInt16BE(val, offset);
        offset += 2;
        break;
      case "unsignedshort":
      case "uint16":
        tag("u");
        buffer.writeUInt16BE(val, offset);
        offset += 2;
        break;
      case "int":
      case "int32":
        tag("I");
        buffer.writeInt32BE(val, offset);
        offset += 4;
        break;
      case "unsignedint":
      case "uint32":
        tag("i");
        buffer.writeUInt32BE(val, offset);
        offset += 4;
        break;
      case "long":
      case "int64":
        tag("l");
        ints.writeInt64BE(buffer, val, offset);
        offset += 8;
        break;
      case "timestamp":
        tag("T");
        ints.writeUInt64BE(buffer, val, offset);
        offset += 8;
        break;
      case "float":
        tag("f");
        buffer.writeFloatBE(val, offset);
        offset += 4;
        break;
      case "decimal":
        tag("D");
        if (val.hasOwnProperty("places") && val.hasOwnProperty("digits") && val.places >= 0 && val.places < 256) {
          buffer[offset] = val.places;
          offset++;
          buffer.writeUInt32BE(val.digits, offset);
          offset += 4;
        } else
          throw new TypeError("Decimal value must be {'places': 0..255, 'digits': uint32}, " + "got " + JSON.stringify(val));
        break;
      default:
        throw new TypeError("Unknown type to encode: " + type);
    }
    return offset - start;
  }
  function decodeFields(slice) {
    var fields = {}, offset = 0, size = slice.length;
    var len, key, val;
    function decodeFieldValue() {
      var tag = String.fromCharCode(slice[offset]);
      offset++;
      switch (tag) {
        case "b":
          val = slice.readInt8(offset);
          offset++;
          break;
        case "B":
          val = slice.readUInt8(offset);
          offset++;
          break;
        case "S":
          len = slice.readUInt32BE(offset);
          offset += 4;
          val = slice.toString("utf8", offset, offset + len);
          offset += len;
          break;
        case "I":
          val = slice.readInt32BE(offset);
          offset += 4;
          break;
        case "i":
          val = slice.readUInt32BE(offset);
          offset += 4;
          break;
        case "D":
          var places = slice[offset];
          offset++;
          var digits = slice.readUInt32BE(offset);
          offset += 4;
          val = { "!": "decimal", value: { places, digits } };
          break;
        case "T":
          val = ints.readUInt64BE(slice, offset);
          offset += 8;
          val = { "!": "timestamp", value: val };
          break;
        case "F":
          len = slice.readUInt32BE(offset);
          offset += 4;
          val = decodeFields(slice.subarray(offset, offset + len));
          offset += len;
          break;
        case "A":
          len = slice.readUInt32BE(offset);
          offset += 4;
          decodeArray(offset + len);
          break;
        case "d":
          val = slice.readDoubleBE(offset);
          offset += 8;
          break;
        case "f":
          val = slice.readFloatBE(offset);
          offset += 4;
          break;
        case "l":
          val = ints.readInt64BE(slice, offset);
          offset += 8;
          break;
        case "s":
          val = slice.readInt16BE(offset);
          offset += 2;
          break;
        case "u":
          val = slice.readUInt16BE(offset);
          offset += 2;
          break;
        case "t":
          val = slice[offset] != 0;
          offset++;
          break;
        case "V":
          val = null;
          break;
        case "x":
          len = slice.readUInt32BE(offset);
          offset += 4;
          val = slice.subarray(offset, offset + len);
          offset += len;
          break;
        default:
          throw new TypeError('Unexpected type tag "' + tag + '"');
      }
    }
    function decodeArray(until) {
      var vals = [];
      while (offset < until) {
        decodeFieldValue();
        vals.push(val);
      }
      val = vals;
    }
    while (offset < size) {
      len = slice.readUInt8(offset);
      offset++;
      key = slice.toString("utf8", offset, offset + len);
      offset += len;
      decodeFieldValue();
      fields[key] = val;
    }
    return fields;
  }
  exports.encodeTable = encodeTable;
  exports.decodeFields = decodeFields;
});

// node_modules/amqplib/lib/defs.js
var require_defs = __commonJS((exports, module) => {
  function decodeBasicQos(buffer) {
    var val, offset = 0, fields = {
      prefetchSize: undefined,
      prefetchCount: undefined,
      global: undefined
    };
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.prefetchSize = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.prefetchCount = val;
    val = !!(1 & buffer[offset]);
    fields.global = val;
    return fields;
  }
  function encodeBasicQos(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(19);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932170, 7);
    offset = 11;
    val = fields.prefetchSize;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'prefetchSize' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.prefetchCount;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'prefetchCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.global;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicQosOk(buffer) {
    return {};
  }
  function encodeBasicQosOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932171, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicConsume(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      consumerTag: undefined,
      noLocal: undefined,
      noAck: undefined,
      exclusive: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    val = !!(1 & buffer[offset]);
    fields.noLocal = val;
    val = !!(2 & buffer[offset]);
    fields.noAck = val;
    val = !!(4 & buffer[offset]);
    fields.exclusive = val;
    val = !!(8 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeBasicConsume(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.consumerTag;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932180, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.consumerTag;
    val === undefined && (val = "");
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    val = fields.noLocal;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.noAck;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.exclusive;
    val === undefined && (val = false);
    val && (bits += 4);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 8);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicConsumeOk(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    return fields;
  }
  function encodeBasicConsumeOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932181, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicCancel(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined,
      nowait: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeBasicCancel(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    var buffer = Buffer.alloc(14 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932190, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicCancelOk(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    return fields;
  }
  function encodeBasicCancelOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932191, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicPublish(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      exchange: undefined,
      routingKey: undefined,
      mandatory: undefined,
      immediate: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.mandatory = val;
    val = !!(2 & buffer[offset]);
    fields.immediate = val;
    return fields;
  }
  function encodeBasicPublish(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.exchange;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932200, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.exchange;
    val === undefined && (val = "");
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.mandatory;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.immediate;
    val === undefined && (val = false);
    val && (bits += 2);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicReturn(buffer) {
    var val, len, offset = 0, fields = {
      replyCode: undefined,
      replyText: undefined,
      exchange: undefined,
      routingKey: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.replyCode = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.replyText = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    return fields;
  }
  function encodeBasicReturn(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.replyText;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'replyText' is the wrong type; must be a string (up to 255 chars)");
    var replyText_len = Buffer.byteLength(val, "utf8");
    varyingSize += replyText_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'routingKey'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932210, 7);
    offset = 11;
    val = fields.replyCode;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'replyCode'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'replyCode' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.replyText;
    val === undefined && (val = "");
    buffer[offset] = replyText_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += replyText_len;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = undefined);
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicDeliver(buffer) {
    var val, len, offset = 0, fields = {
      consumerTag: undefined,
      deliveryTag: undefined,
      redelivered: undefined,
      exchange: undefined,
      routingKey: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.consumerTag = val;
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.redelivered = val;
    offset++;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    return fields;
  }
  function encodeBasicDeliver(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.consumerTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerTag'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'consumerTag' is the wrong type; must be a string (up to 255 chars)");
    var consumerTag_len = Buffer.byteLength(val, "utf8");
    varyingSize += consumerTag_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'routingKey'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(24 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932220, 7);
    offset = 11;
    val = fields.consumerTag;
    val === undefined && (val = undefined);
    buffer[offset] = consumerTag_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += consumerTag_len;
    val = fields.deliveryTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'deliveryTag'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.redelivered;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = undefined);
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicGet(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      noAck: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.noAck = val;
    return fields;
  }
  function encodeBasicGet(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932230, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.noAck;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicGetOk(buffer) {
    var val, len, offset = 0, fields = {
      deliveryTag: undefined,
      redelivered: undefined,
      exchange: undefined,
      routingKey: undefined,
      messageCount: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.redelivered = val;
    offset++;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    return fields;
  }
  function encodeBasicGetOk(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'routingKey'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    var buffer = Buffer.alloc(27 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932231, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'deliveryTag'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.redelivered;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = undefined);
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicGetEmpty(buffer) {
    var val, len, offset = 0, fields = {
      clusterId: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.clusterId = val;
    return fields;
  }
  function encodeBasicGetEmpty(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.clusterId;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'clusterId' is the wrong type; must be a string (up to 255 chars)");
    var clusterId_len = Buffer.byteLength(val, "utf8");
    varyingSize += clusterId_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932232, 7);
    offset = 11;
    val = fields.clusterId;
    val === undefined && (val = "");
    buffer[offset] = clusterId_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += clusterId_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicAck(buffer) {
    var val, offset = 0, fields = {
      deliveryTag: undefined,
      multiple: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.multiple = val;
    return fields;
  }
  function encodeBasicAck(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(21);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932240, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.multiple;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicReject(buffer) {
    var val, offset = 0, fields = {
      deliveryTag: undefined,
      requeue: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicReject(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(21);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932250, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'deliveryTag'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.requeue;
    val === undefined && (val = true);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicRecoverAsync(buffer) {
    var val, fields = {
      requeue: undefined
    };
    val = !!(1 & buffer[0]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicRecoverAsync(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932260, 7);
    offset = 11;
    val = fields.requeue;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicRecover(buffer) {
    var val, fields = {
      requeue: undefined
    };
    val = !!(1 & buffer[0]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicRecover(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932270, 7);
    offset = 11;
    val = fields.requeue;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicRecoverOk(buffer) {
    return {};
  }
  function encodeBasicRecoverOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932271, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeBasicNack(buffer) {
    var val, offset = 0, fields = {
      deliveryTag: undefined,
      multiple: undefined,
      requeue: undefined
    };
    val = ints.readUInt64BE(buffer, offset);
    offset += 8;
    fields.deliveryTag = val;
    val = !!(1 & buffer[offset]);
    fields.multiple = val;
    val = !!(2 & buffer[offset]);
    fields.requeue = val;
    return fields;
  }
  function encodeBasicNack(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(21);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932280, 7);
    offset = 11;
    val = fields.deliveryTag;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'deliveryTag' is the wrong type; must be a number (but not NaN)");
    ints.writeUInt64BE(buffer, val, offset);
    offset += 8;
    val = fields.multiple;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.requeue;
    val === undefined && (val = true);
    val && (bits += 2);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionStart(buffer) {
    var val, len, offset = 0, fields = {
      versionMajor: undefined,
      versionMinor: undefined,
      serverProperties: undefined,
      mechanisms: undefined,
      locales: undefined
    };
    val = buffer[offset];
    offset++;
    fields.versionMajor = val;
    val = buffer[offset];
    offset++;
    fields.versionMinor = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.serverProperties = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.mechanisms = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.locales = val;
    return fields;
  }
  function encodeConnectionStart(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0, scratchOffset = 0;
    val = fields.serverProperties;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'serverProperties'");
    if (typeof val != "object")
      throw new TypeError("Field 'serverProperties' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var serverProperties_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += serverProperties_encoded.length;
    val = fields.mechanisms;
    if (val === undefined)
      val = Buffer.from("PLAIN");
    else if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'mechanisms' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    val = fields.locales;
    if (val === undefined)
      val = Buffer.from("en_US");
    else if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'locales' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(22 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655370, 7);
    offset = 11;
    val = fields.versionMajor;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'versionMajor' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt8(val, offset);
    offset++;
    val = fields.versionMinor;
    if (val === undefined)
      val = 9;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'versionMinor' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt8(val, offset);
    offset++;
    offset += serverProperties_encoded.copy(buffer, offset);
    val = fields.mechanisms;
    val === undefined && (val = Buffer.from("PLAIN"));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    val = fields.locales;
    val === undefined && (val = Buffer.from("en_US"));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionStartOk(buffer) {
    var val, len, offset = 0, fields = {
      clientProperties: undefined,
      mechanism: undefined,
      response: undefined,
      locale: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.clientProperties = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.mechanism = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.response = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.locale = val;
    return fields;
  }
  function encodeConnectionStartOk(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0, scratchOffset = 0;
    val = fields.clientProperties;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'clientProperties'");
    if (typeof val != "object")
      throw new TypeError("Field 'clientProperties' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var clientProperties_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += clientProperties_encoded.length;
    val = fields.mechanism;
    if (val === undefined)
      val = "PLAIN";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'mechanism' is the wrong type; must be a string (up to 255 chars)");
    var mechanism_len = Buffer.byteLength(val, "utf8");
    varyingSize += mechanism_len;
    val = fields.response;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'response'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'response' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    val = fields.locale;
    if (val === undefined)
      val = "en_US";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'locale' is the wrong type; must be a string (up to 255 chars)");
    var locale_len = Buffer.byteLength(val, "utf8");
    varyingSize += locale_len;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655371, 7);
    offset = 11;
    offset += clientProperties_encoded.copy(buffer, offset);
    val = fields.mechanism;
    val === undefined && (val = "PLAIN");
    buffer[offset] = mechanism_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += mechanism_len;
    val = fields.response;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    val = fields.locale;
    val === undefined && (val = "en_US");
    buffer[offset] = locale_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += locale_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionSecure(buffer) {
    var val, len, offset = 0, fields = {
      challenge: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.challenge = val;
    return fields;
  }
  function encodeConnectionSecure(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.challenge;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'challenge'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'challenge' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655380, 7);
    offset = 11;
    val = fields.challenge;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionSecureOk(buffer) {
    var val, len, offset = 0, fields = {
      response: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.response = val;
    return fields;
  }
  function encodeConnectionSecureOk(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.response;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'response'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'response' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655381, 7);
    offset = 11;
    val = fields.response;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionTune(buffer) {
    var val, offset = 0, fields = {
      channelMax: undefined,
      frameMax: undefined,
      heartbeat: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.channelMax = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.frameMax = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.heartbeat = val;
    return fields;
  }
  function encodeConnectionTune(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(20);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655390, 7);
    offset = 11;
    val = fields.channelMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'channelMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.frameMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'frameMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.heartbeat;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'heartbeat' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionTuneOk(buffer) {
    var val, offset = 0, fields = {
      channelMax: undefined,
      frameMax: undefined,
      heartbeat: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.channelMax = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.frameMax = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.heartbeat = val;
    return fields;
  }
  function encodeConnectionTuneOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(20);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655391, 7);
    offset = 11;
    val = fields.channelMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'channelMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.frameMax;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'frameMax' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.heartbeat;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'heartbeat' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionOpen(buffer) {
    var val, len, offset = 0, fields = {
      virtualHost: undefined,
      capabilities: undefined,
      insist: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.virtualHost = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.capabilities = val;
    val = !!(1 & buffer[offset]);
    fields.insist = val;
    return fields;
  }
  function encodeConnectionOpen(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.virtualHost;
    if (val === undefined)
      val = "/";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'virtualHost' is the wrong type; must be a string (up to 255 chars)");
    var virtualHost_len = Buffer.byteLength(val, "utf8");
    varyingSize += virtualHost_len;
    val = fields.capabilities;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'capabilities' is the wrong type; must be a string (up to 255 chars)");
    var capabilities_len = Buffer.byteLength(val, "utf8");
    varyingSize += capabilities_len;
    var buffer = Buffer.alloc(15 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655400, 7);
    offset = 11;
    val = fields.virtualHost;
    val === undefined && (val = "/");
    buffer[offset] = virtualHost_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += virtualHost_len;
    val = fields.capabilities;
    val === undefined && (val = "");
    buffer[offset] = capabilities_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += capabilities_len;
    val = fields.insist;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionOpenOk(buffer) {
    var val, len, offset = 0, fields = {
      knownHosts: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.knownHosts = val;
    return fields;
  }
  function encodeConnectionOpenOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.knownHosts;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'knownHosts' is the wrong type; must be a string (up to 255 chars)");
    var knownHosts_len = Buffer.byteLength(val, "utf8");
    varyingSize += knownHosts_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655401, 7);
    offset = 11;
    val = fields.knownHosts;
    val === undefined && (val = "");
    buffer[offset] = knownHosts_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += knownHosts_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionClose(buffer) {
    var val, len, offset = 0, fields = {
      replyCode: undefined,
      replyText: undefined,
      classId: undefined,
      methodId: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.replyCode = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.replyText = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.classId = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.methodId = val;
    return fields;
  }
  function encodeConnectionClose(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.replyText;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'replyText' is the wrong type; must be a string (up to 255 chars)");
    var replyText_len = Buffer.byteLength(val, "utf8");
    varyingSize += replyText_len;
    var buffer = Buffer.alloc(19 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655410, 7);
    offset = 11;
    val = fields.replyCode;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'replyCode'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'replyCode' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.replyText;
    val === undefined && (val = "");
    buffer[offset] = replyText_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += replyText_len;
    val = fields.classId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'classId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'classId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.methodId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'methodId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'methodId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionCloseOk(buffer) {
    return {};
  }
  function encodeConnectionCloseOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655411, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionBlocked(buffer) {
    var val, len, offset = 0, fields = {
      reason: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.reason = val;
    return fields;
  }
  function encodeConnectionBlocked(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.reason;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'reason' is the wrong type; must be a string (up to 255 chars)");
    var reason_len = Buffer.byteLength(val, "utf8");
    varyingSize += reason_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655420, 7);
    offset = 11;
    val = fields.reason;
    val === undefined && (val = "");
    buffer[offset] = reason_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += reason_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionUnblocked(buffer) {
    return {};
  }
  function encodeConnectionUnblocked(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655421, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionUpdateSecret(buffer) {
    var val, len, offset = 0, fields = {
      newSecret: undefined,
      reason: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.newSecret = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.reason = val;
    return fields;
  }
  function encodeConnectionUpdateSecret(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.newSecret;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'newSecret'");
    if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'newSecret' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    val = fields.reason;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'reason'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'reason' is the wrong type; must be a string (up to 255 chars)");
    var reason_len = Buffer.byteLength(val, "utf8");
    varyingSize += reason_len;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655430, 7);
    offset = 11;
    val = fields.newSecret;
    val === undefined && (val = Buffer.from(undefined));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    val = fields.reason;
    val === undefined && (val = undefined);
    buffer[offset] = reason_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += reason_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConnectionUpdateSecretOk(buffer) {
    return {};
  }
  function encodeConnectionUpdateSecretOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(655431, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelOpen(buffer) {
    var val, len, offset = 0, fields = {
      outOfBand: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.outOfBand = val;
    return fields;
  }
  function encodeChannelOpen(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.outOfBand;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'outOfBand' is the wrong type; must be a string (up to 255 chars)");
    var outOfBand_len = Buffer.byteLength(val, "utf8");
    varyingSize += outOfBand_len;
    var buffer = Buffer.alloc(13 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310730, 7);
    offset = 11;
    val = fields.outOfBand;
    val === undefined && (val = "");
    buffer[offset] = outOfBand_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += outOfBand_len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelOpenOk(buffer) {
    var val, len, offset = 0, fields = {
      channelId: undefined
    };
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = buffer.subarray(offset, offset + len);
    offset += len;
    fields.channelId = val;
    return fields;
  }
  function encodeChannelOpenOk(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0;
    val = fields.channelId;
    if (val === undefined)
      val = Buffer.from("");
    else if (!Buffer.isBuffer(val))
      throw new TypeError("Field 'channelId' is the wrong type; must be a Buffer");
    varyingSize += val.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310731, 7);
    offset = 11;
    val = fields.channelId;
    val === undefined && (val = Buffer.from(""));
    len = val.length;
    buffer.writeUInt32BE(len, offset);
    offset += 4;
    val.copy(buffer, offset);
    offset += len;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelFlow(buffer) {
    var val, fields = {
      active: undefined
    };
    val = !!(1 & buffer[0]);
    fields.active = val;
    return fields;
  }
  function encodeChannelFlow(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310740, 7);
    offset = 11;
    val = fields.active;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'active'");
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelFlowOk(buffer) {
    var val, fields = {
      active: undefined
    };
    val = !!(1 & buffer[0]);
    fields.active = val;
    return fields;
  }
  function encodeChannelFlowOk(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310741, 7);
    offset = 11;
    val = fields.active;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'active'");
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelClose(buffer) {
    var val, len, offset = 0, fields = {
      replyCode: undefined,
      replyText: undefined,
      classId: undefined,
      methodId: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.replyCode = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.replyText = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.classId = val;
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.methodId = val;
    return fields;
  }
  function encodeChannelClose(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.replyText;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'replyText' is the wrong type; must be a string (up to 255 chars)");
    var replyText_len = Buffer.byteLength(val, "utf8");
    varyingSize += replyText_len;
    var buffer = Buffer.alloc(19 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310760, 7);
    offset = 11;
    val = fields.replyCode;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'replyCode'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'replyCode' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.replyText;
    val === undefined && (val = "");
    buffer[offset] = replyText_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += replyText_len;
    val = fields.classId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'classId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'classId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.methodId;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'methodId'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'methodId' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeChannelCloseOk(buffer) {
    return {};
  }
  function encodeChannelCloseOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1310761, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeAccessRequest(buffer) {
    var val, len, offset = 0, fields = {
      realm: undefined,
      exclusive: undefined,
      passive: undefined,
      active: undefined,
      write: undefined,
      read: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.realm = val;
    val = !!(1 & buffer[offset]);
    fields.exclusive = val;
    val = !!(2 & buffer[offset]);
    fields.passive = val;
    val = !!(4 & buffer[offset]);
    fields.active = val;
    val = !!(8 & buffer[offset]);
    fields.write = val;
    val = !!(16 & buffer[offset]);
    fields.read = val;
    return fields;
  }
  function encodeAccessRequest(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.realm;
    if (val === undefined)
      val = "/data";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'realm' is the wrong type; must be a string (up to 255 chars)");
    var realm_len = Buffer.byteLength(val, "utf8");
    varyingSize += realm_len;
    var buffer = Buffer.alloc(14 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1966090, 7);
    offset = 11;
    val = fields.realm;
    val === undefined && (val = "/data");
    buffer[offset] = realm_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += realm_len;
    val = fields.exclusive;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.passive;
    val === undefined && (val = true);
    val && (bits += 2);
    val = fields.active;
    val === undefined && (val = true);
    val && (bits += 4);
    val = fields.write;
    val === undefined && (val = true);
    val && (bits += 8);
    val = fields.read;
    val === undefined && (val = true);
    val && (bits += 16);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeAccessRequestOk(buffer) {
    var val, offset = 0, fields = {
      ticket: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    return fields;
  }
  function encodeAccessRequestOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(14);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(1966091, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 1;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDeclare(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      exchange: undefined,
      type: undefined,
      passive: undefined,
      durable: undefined,
      autoDelete: undefined,
      internal: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.type = val;
    val = !!(1 & buffer[offset]);
    fields.passive = val;
    val = !!(2 & buffer[offset]);
    fields.durable = val;
    val = !!(4 & buffer[offset]);
    fields.autoDelete = val;
    val = !!(8 & buffer[offset]);
    fields.internal = val;
    val = !!(16 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeExchangeDeclare(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.type;
    if (val === undefined)
      val = "direct";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'type' is the wrong type; must be a string (up to 255 chars)");
    var type_len = Buffer.byteLength(val, "utf8");
    varyingSize += type_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621450, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.type;
    val === undefined && (val = "direct");
    buffer[offset] = type_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += type_len;
    val = fields.passive;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.durable;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.autoDelete;
    val === undefined && (val = false);
    val && (bits += 4);
    val = fields.internal;
    val === undefined && (val = false);
    val && (bits += 8);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 16);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDeclareOk(buffer) {
    return {};
  }
  function encodeExchangeDeclareOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621451, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDelete(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      exchange: undefined,
      ifUnused: undefined,
      nowait: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    val = !!(1 & buffer[offset]);
    fields.ifUnused = val;
    val = !!(2 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeExchangeDelete(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621460, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.ifUnused;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 2);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeDeleteOk(buffer) {
    return {};
  }
  function encodeExchangeDeleteOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621461, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeBind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      destination: undefined,
      source: undefined,
      routingKey: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.destination = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.source = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeExchangeBind(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.destination;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'destination'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'destination' is the wrong type; must be a string (up to 255 chars)");
    var destination_len = Buffer.byteLength(val, "utf8");
    varyingSize += destination_len;
    val = fields.source;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'source'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'source' is the wrong type; must be a string (up to 255 chars)");
    var source_len = Buffer.byteLength(val, "utf8");
    varyingSize += source_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621470, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.destination;
    val === undefined && (val = undefined);
    buffer[offset] = destination_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += destination_len;
    val = fields.source;
    val === undefined && (val = undefined);
    buffer[offset] = source_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += source_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeBindOk(buffer) {
    return {};
  }
  function encodeExchangeBindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621471, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeUnbind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      destination: undefined,
      source: undefined,
      routingKey: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.destination = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.source = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeExchangeUnbind(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.destination;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'destination'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'destination' is the wrong type; must be a string (up to 255 chars)");
    var destination_len = Buffer.byteLength(val, "utf8");
    varyingSize += destination_len;
    val = fields.source;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'source'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'source' is the wrong type; must be a string (up to 255 chars)");
    var source_len = Buffer.byteLength(val, "utf8");
    varyingSize += source_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621480, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.destination;
    val === undefined && (val = undefined);
    buffer[offset] = destination_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += destination_len;
    val = fields.source;
    val === undefined && (val = undefined);
    buffer[offset] = source_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += source_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeExchangeUnbindOk(buffer) {
    return {};
  }
  function encodeExchangeUnbindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(2621491, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDeclare(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      passive: undefined,
      durable: undefined,
      exclusive: undefined,
      autoDelete: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.passive = val;
    val = !!(2 & buffer[offset]);
    fields.durable = val;
    val = !!(4 & buffer[offset]);
    fields.exclusive = val;
    val = !!(8 & buffer[offset]);
    fields.autoDelete = val;
    val = !!(16 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeQueueDeclare(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276810, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.passive;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.durable;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.exclusive;
    val === undefined && (val = false);
    val && (bits += 4);
    val = fields.autoDelete;
    val === undefined && (val = false);
    val && (bits += 8);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 16);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDeclareOk(buffer) {
    var val, len, offset = 0, fields = {
      queue: undefined,
      messageCount: undefined,
      consumerCount: undefined
    };
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.consumerCount = val;
    return fields;
  }
  function encodeQueueDeclareOk(channel, fields) {
    var offset = 0, val = null, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'queue'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(21 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276811, 7);
    offset = 11;
    val = fields.queue;
    val === undefined && (val = undefined);
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    val = fields.consumerCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'consumerCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'consumerCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueBind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      exchange: undefined,
      routingKey: undefined,
      nowait: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    offset++;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeQueueBind(channel, fields) {
    var len, offset = 0, val = null, bits = 0, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(18 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276820, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    bits = 0;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueBindOk(buffer) {
    return {};
  }
  function encodeQueueBindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276821, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueuePurge(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      nowait: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeQueuePurge(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276830, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueuePurgeOk(buffer) {
    var val, offset = 0, fields = {
      messageCount: undefined
    };
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    return fields;
  }
  function encodeQueuePurgeOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(16);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276831, 7);
    offset = 11;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDelete(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      ifUnused: undefined,
      ifEmpty: undefined,
      nowait: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    val = !!(1 & buffer[offset]);
    fields.ifUnused = val;
    val = !!(2 & buffer[offset]);
    fields.ifEmpty = val;
    val = !!(4 & buffer[offset]);
    fields.nowait = val;
    return fields;
  }
  function encodeQueueDelete(channel, fields) {
    var offset = 0, val = null, bits = 0, varyingSize = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    var buffer = Buffer.alloc(16 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276840, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.ifUnused;
    val === undefined && (val = false);
    val && (bits += 1);
    val = fields.ifEmpty;
    val === undefined && (val = false);
    val && (bits += 2);
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 4);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueDeleteOk(buffer) {
    var val, offset = 0, fields = {
      messageCount: undefined
    };
    val = buffer.readUInt32BE(offset);
    offset += 4;
    fields.messageCount = val;
    return fields;
  }
  function encodeQueueDeleteOk(channel, fields) {
    var offset = 0, val = null, buffer = Buffer.alloc(16);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276841, 7);
    offset = 11;
    val = fields.messageCount;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'messageCount'");
    if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'messageCount' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt32BE(val, offset);
    offset += 4;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueUnbind(buffer) {
    var val, len, offset = 0, fields = {
      ticket: undefined,
      queue: undefined,
      exchange: undefined,
      routingKey: undefined,
      arguments: undefined
    };
    val = buffer.readUInt16BE(offset);
    offset += 2;
    fields.ticket = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.queue = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.exchange = val;
    len = buffer.readUInt8(offset);
    offset++;
    val = buffer.toString("utf8", offset, offset + len);
    offset += len;
    fields.routingKey = val;
    len = buffer.readUInt32BE(offset);
    offset += 4;
    val = decodeFields(buffer.subarray(offset, offset + len));
    offset += len;
    fields.arguments = val;
    return fields;
  }
  function encodeQueueUnbind(channel, fields) {
    var len, offset = 0, val = null, varyingSize = 0, scratchOffset = 0;
    val = fields.queue;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'queue' is the wrong type; must be a string (up to 255 chars)");
    var queue_len = Buffer.byteLength(val, "utf8");
    varyingSize += queue_len;
    val = fields.exchange;
    if (val === undefined)
      throw new Error("Missing value for mandatory field 'exchange'");
    if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'exchange' is the wrong type; must be a string (up to 255 chars)");
    var exchange_len = Buffer.byteLength(val, "utf8");
    varyingSize += exchange_len;
    val = fields.routingKey;
    if (val === undefined)
      val = "";
    else if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
      throw new TypeError("Field 'routingKey' is the wrong type; must be a string (up to 255 chars)");
    var routingKey_len = Buffer.byteLength(val, "utf8");
    varyingSize += routingKey_len;
    val = fields.arguments;
    if (val === undefined)
      val = {};
    else if (typeof val != "object")
      throw new TypeError("Field 'arguments' is the wrong type; must be an object");
    len = encodeTable(SCRATCH, val, scratchOffset);
    var arguments_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
    scratchOffset += len;
    varyingSize += arguments_encoded.length;
    var buffer = Buffer.alloc(17 + varyingSize);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276850, 7);
    offset = 11;
    val = fields.ticket;
    if (val === undefined)
      val = 0;
    else if (typeof val != "number" || isNaN(val))
      throw new TypeError("Field 'ticket' is the wrong type; must be a number (but not NaN)");
    buffer.writeUInt16BE(val, offset);
    offset += 2;
    val = fields.queue;
    val === undefined && (val = "");
    buffer[offset] = queue_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += queue_len;
    val = fields.exchange;
    val === undefined && (val = undefined);
    buffer[offset] = exchange_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += exchange_len;
    val = fields.routingKey;
    val === undefined && (val = "");
    buffer[offset] = routingKey_len;
    offset++;
    buffer.write(val, offset, "utf8");
    offset += routingKey_len;
    offset += arguments_encoded.copy(buffer, offset);
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeQueueUnbindOk(buffer) {
    return {};
  }
  function encodeQueueUnbindOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3276851, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxSelect(buffer) {
    return {};
  }
  function encodeTxSelect(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898250, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxSelectOk(buffer) {
    return {};
  }
  function encodeTxSelectOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898251, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxCommit(buffer) {
    return {};
  }
  function encodeTxCommit(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898260, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxCommitOk(buffer) {
    return {};
  }
  function encodeTxCommitOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898261, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxRollback(buffer) {
    return {};
  }
  function encodeTxRollback(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898270, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeTxRollbackOk(buffer) {
    return {};
  }
  function encodeTxRollbackOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5898271, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConfirmSelect(buffer) {
    var val, fields = {
      nowait: undefined
    };
    val = !!(1 & buffer[0]);
    fields.nowait = val;
    return fields;
  }
  function encodeConfirmSelect(channel, fields) {
    var offset = 0, val = null, bits = 0, buffer = Buffer.alloc(13);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5570570, 7);
    offset = 11;
    val = fields.nowait;
    val === undefined && (val = false);
    val && (bits += 1);
    buffer[offset] = bits;
    offset++;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function decodeConfirmSelectOk(buffer) {
    return {};
  }
  function encodeConfirmSelectOk(channel, fields) {
    var offset = 0, buffer = Buffer.alloc(12);
    buffer[0] = 1;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(5570571, 7);
    offset = 11;
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    return buffer;
  }
  function encodeBasicProperties(channel, size, fields) {
    var val, len, offset = 0, flags = 0, scratchOffset = 0, varyingSize = 0;
    val = fields.contentType;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'contentType' is the wrong type; must be a string (up to 255 chars)");
      var contentType_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += contentType_len;
    }
    val = fields.contentEncoding;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'contentEncoding' is the wrong type; must be a string (up to 255 chars)");
      var contentEncoding_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += contentEncoding_len;
    }
    val = fields.headers;
    if (val != null) {
      if (typeof val != "object")
        throw new TypeError("Field 'headers' is the wrong type; must be an object");
      len = encodeTable(SCRATCH, val, scratchOffset);
      var headers_encoded = SCRATCH.slice(scratchOffset, scratchOffset + len);
      scratchOffset += len;
      varyingSize += headers_encoded.length;
    }
    val = fields.deliveryMode;
    if (val != null) {
      if (typeof val != "number" || isNaN(val))
        throw new TypeError("Field 'deliveryMode' is the wrong type; must be a number (but not NaN)");
      varyingSize += 1;
    }
    val = fields.priority;
    if (val != null) {
      if (typeof val != "number" || isNaN(val))
        throw new TypeError("Field 'priority' is the wrong type; must be a number (but not NaN)");
      varyingSize += 1;
    }
    val = fields.correlationId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'correlationId' is the wrong type; must be a string (up to 255 chars)");
      var correlationId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += correlationId_len;
    }
    val = fields.replyTo;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'replyTo' is the wrong type; must be a string (up to 255 chars)");
      var replyTo_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += replyTo_len;
    }
    val = fields.expiration;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'expiration' is the wrong type; must be a string (up to 255 chars)");
      var expiration_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += expiration_len;
    }
    val = fields.messageId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'messageId' is the wrong type; must be a string (up to 255 chars)");
      var messageId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += messageId_len;
    }
    val = fields.timestamp;
    if (val != null) {
      if (typeof val != "number" || isNaN(val))
        throw new TypeError("Field 'timestamp' is the wrong type; must be a number (but not NaN)");
      varyingSize += 8;
    }
    val = fields.type;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'type' is the wrong type; must be a string (up to 255 chars)");
      var type_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += type_len;
    }
    val = fields.userId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'userId' is the wrong type; must be a string (up to 255 chars)");
      var userId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += userId_len;
    }
    val = fields.appId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'appId' is the wrong type; must be a string (up to 255 chars)");
      var appId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += appId_len;
    }
    val = fields.clusterId;
    if (val != null) {
      if (!(typeof val == "string" && Buffer.byteLength(val) < 256))
        throw new TypeError("Field 'clusterId' is the wrong type; must be a string (up to 255 chars)");
      var clusterId_len = Buffer.byteLength(val, "utf8");
      varyingSize += 1;
      varyingSize += clusterId_len;
    }
    var buffer = Buffer.alloc(22 + varyingSize);
    buffer[0] = 2;
    buffer.writeUInt16BE(channel, 1);
    buffer.writeUInt32BE(3932160, 7);
    ints.writeUInt64BE(buffer, size, 11);
    flags = 0;
    offset = 21;
    val = fields.contentType;
    if (val != null) {
      flags += 32768;
      buffer[offset] = contentType_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += contentType_len;
    }
    val = fields.contentEncoding;
    if (val != null) {
      flags += 16384;
      buffer[offset] = contentEncoding_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += contentEncoding_len;
    }
    val = fields.headers;
    if (val != null) {
      flags += 8192;
      offset += headers_encoded.copy(buffer, offset);
    }
    val = fields.deliveryMode;
    if (val != null) {
      flags += 4096;
      buffer.writeUInt8(val, offset);
      offset++;
    }
    val = fields.priority;
    if (val != null) {
      flags += 2048;
      buffer.writeUInt8(val, offset);
      offset++;
    }
    val = fields.correlationId;
    if (val != null) {
      flags += 1024;
      buffer[offset] = correlationId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += correlationId_len;
    }
    val = fields.replyTo;
    if (val != null) {
      flags += 512;
      buffer[offset] = replyTo_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += replyTo_len;
    }
    val = fields.expiration;
    if (val != null) {
      flags += 256;
      buffer[offset] = expiration_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += expiration_len;
    }
    val = fields.messageId;
    if (val != null) {
      flags += 128;
      buffer[offset] = messageId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += messageId_len;
    }
    val = fields.timestamp;
    if (val != null) {
      flags += 64;
      ints.writeUInt64BE(buffer, val, offset);
      offset += 8;
    }
    val = fields.type;
    if (val != null) {
      flags += 32;
      buffer[offset] = type_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += type_len;
    }
    val = fields.userId;
    if (val != null) {
      flags += 16;
      buffer[offset] = userId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += userId_len;
    }
    val = fields.appId;
    if (val != null) {
      flags += 8;
      buffer[offset] = appId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += appId_len;
    }
    val = fields.clusterId;
    if (val != null) {
      flags += 4;
      buffer[offset] = clusterId_len;
      offset++;
      buffer.write(val, offset, "utf8");
      offset += clusterId_len;
    }
    buffer[offset] = 206;
    buffer.writeUInt32BE(offset - 7, 3);
    buffer.writeUInt16BE(flags, 19);
    return buffer.subarray(0, offset + 1);
  }
  function decodeBasicProperties(buffer) {
    var flags, val, len, offset = 2;
    flags = buffer.readUInt16BE(0);
    if (flags === 0)
      return {};
    var fields = {
      contentType: undefined,
      contentEncoding: undefined,
      headers: undefined,
      deliveryMode: undefined,
      priority: undefined,
      correlationId: undefined,
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: undefined,
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined
    };
    if (32768 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.contentType = val;
    }
    if (16384 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.contentEncoding = val;
    }
    if (8192 & flags) {
      len = buffer.readUInt32BE(offset);
      offset += 4;
      val = decodeFields(buffer.subarray(offset, offset + len));
      offset += len;
      fields.headers = val;
    }
    if (4096 & flags) {
      val = buffer[offset];
      offset++;
      fields.deliveryMode = val;
    }
    if (2048 & flags) {
      val = buffer[offset];
      offset++;
      fields.priority = val;
    }
    if (1024 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.correlationId = val;
    }
    if (512 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.replyTo = val;
    }
    if (256 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.expiration = val;
    }
    if (128 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.messageId = val;
    }
    if (64 & flags) {
      val = ints.readUInt64BE(buffer, offset);
      offset += 8;
      fields.timestamp = val;
    }
    if (32 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.type = val;
    }
    if (16 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.userId = val;
    }
    if (8 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.appId = val;
    }
    if (4 & flags) {
      len = buffer.readUInt8(offset);
      offset++;
      val = buffer.toString("utf8", offset, offset + len);
      offset += len;
      fields.clusterId = val;
    }
    return fields;
  }
  var codec = require_codec();
  var ints = require_buffer_more_ints();
  var encodeTable = codec.encodeTable;
  var decodeFields = codec.decodeFields;
  var SCRATCH = Buffer.alloc(65536);
  var EMPTY_OBJECT = Object.freeze({});
  exports.constants = {
    FRAME_METHOD: 1,
    FRAME_HEADER: 2,
    FRAME_BODY: 3,
    FRAME_HEARTBEAT: 8,
    FRAME_MIN_SIZE: 4096,
    FRAME_END: 206,
    REPLY_SUCCESS: 200,
    CONTENT_TOO_LARGE: 311,
    NO_ROUTE: 312,
    NO_CONSUMERS: 313,
    ACCESS_REFUSED: 403,
    NOT_FOUND: 404,
    RESOURCE_LOCKED: 405,
    PRECONDITION_FAILED: 406,
    CONNECTION_FORCED: 320,
    INVALID_PATH: 402,
    FRAME_ERROR: 501,
    SYNTAX_ERROR: 502,
    COMMAND_INVALID: 503,
    CHANNEL_ERROR: 504,
    UNEXPECTED_FRAME: 505,
    RESOURCE_ERROR: 506,
    NOT_ALLOWED: 530,
    NOT_IMPLEMENTED: 540,
    INTERNAL_ERROR: 541
  };
  exports.constant_strs = {
    "1": "FRAME-METHOD",
    "2": "FRAME-HEADER",
    "3": "FRAME-BODY",
    "8": "FRAME-HEARTBEAT",
    "200": "REPLY-SUCCESS",
    "206": "FRAME-END",
    "311": "CONTENT-TOO-LARGE",
    "312": "NO-ROUTE",
    "313": "NO-CONSUMERS",
    "320": "CONNECTION-FORCED",
    "402": "INVALID-PATH",
    "403": "ACCESS-REFUSED",
    "404": "NOT-FOUND",
    "405": "RESOURCE-LOCKED",
    "406": "PRECONDITION-FAILED",
    "501": "FRAME-ERROR",
    "502": "SYNTAX-ERROR",
    "503": "COMMAND-INVALID",
    "504": "CHANNEL-ERROR",
    "505": "UNEXPECTED-FRAME",
    "506": "RESOURCE-ERROR",
    "530": "NOT-ALLOWED",
    "540": "NOT-IMPLEMENTED",
    "541": "INTERNAL-ERROR",
    "4096": "FRAME-MIN-SIZE"
  };
  exports.FRAME_OVERHEAD = 8;
  exports.decode = function(id, buf) {
    switch (id) {
      case 3932170:
        return decodeBasicQos(buf);
      case 3932171:
        return decodeBasicQosOk(buf);
      case 3932180:
        return decodeBasicConsume(buf);
      case 3932181:
        return decodeBasicConsumeOk(buf);
      case 3932190:
        return decodeBasicCancel(buf);
      case 3932191:
        return decodeBasicCancelOk(buf);
      case 3932200:
        return decodeBasicPublish(buf);
      case 3932210:
        return decodeBasicReturn(buf);
      case 3932220:
        return decodeBasicDeliver(buf);
      case 3932230:
        return decodeBasicGet(buf);
      case 3932231:
        return decodeBasicGetOk(buf);
      case 3932232:
        return decodeBasicGetEmpty(buf);
      case 3932240:
        return decodeBasicAck(buf);
      case 3932250:
        return decodeBasicReject(buf);
      case 3932260:
        return decodeBasicRecoverAsync(buf);
      case 3932270:
        return decodeBasicRecover(buf);
      case 3932271:
        return decodeBasicRecoverOk(buf);
      case 3932280:
        return decodeBasicNack(buf);
      case 655370:
        return decodeConnectionStart(buf);
      case 655371:
        return decodeConnectionStartOk(buf);
      case 655380:
        return decodeConnectionSecure(buf);
      case 655381:
        return decodeConnectionSecureOk(buf);
      case 655390:
        return decodeConnectionTune(buf);
      case 655391:
        return decodeConnectionTuneOk(buf);
      case 655400:
        return decodeConnectionOpen(buf);
      case 655401:
        return decodeConnectionOpenOk(buf);
      case 655410:
        return decodeConnectionClose(buf);
      case 655411:
        return decodeConnectionCloseOk(buf);
      case 655420:
        return decodeConnectionBlocked(buf);
      case 655421:
        return decodeConnectionUnblocked(buf);
      case 655430:
        return decodeConnectionUpdateSecret(buf);
      case 655431:
        return decodeConnectionUpdateSecretOk(buf);
      case 1310730:
        return decodeChannelOpen(buf);
      case 1310731:
        return decodeChannelOpenOk(buf);
      case 1310740:
        return decodeChannelFlow(buf);
      case 1310741:
        return decodeChannelFlowOk(buf);
      case 1310760:
        return decodeChannelClose(buf);
      case 1310761:
        return decodeChannelCloseOk(buf);
      case 1966090:
        return decodeAccessRequest(buf);
      case 1966091:
        return decodeAccessRequestOk(buf);
      case 2621450:
        return decodeExchangeDeclare(buf);
      case 2621451:
        return decodeExchangeDeclareOk(buf);
      case 2621460:
        return decodeExchangeDelete(buf);
      case 2621461:
        return decodeExchangeDeleteOk(buf);
      case 2621470:
        return decodeExchangeBind(buf);
      case 2621471:
        return decodeExchangeBindOk(buf);
      case 2621480:
        return decodeExchangeUnbind(buf);
      case 2621491:
        return decodeExchangeUnbindOk(buf);
      case 3276810:
        return decodeQueueDeclare(buf);
      case 3276811:
        return decodeQueueDeclareOk(buf);
      case 3276820:
        return decodeQueueBind(buf);
      case 3276821:
        return decodeQueueBindOk(buf);
      case 3276830:
        return decodeQueuePurge(buf);
      case 3276831:
        return decodeQueuePurgeOk(buf);
      case 3276840:
        return decodeQueueDelete(buf);
      case 3276841:
        return decodeQueueDeleteOk(buf);
      case 3276850:
        return decodeQueueUnbind(buf);
      case 3276851:
        return decodeQueueUnbindOk(buf);
      case 5898250:
        return decodeTxSelect(buf);
      case 5898251:
        return decodeTxSelectOk(buf);
      case 5898260:
        return decodeTxCommit(buf);
      case 5898261:
        return decodeTxCommitOk(buf);
      case 5898270:
        return decodeTxRollback(buf);
      case 5898271:
        return decodeTxRollbackOk(buf);
      case 5570570:
        return decodeConfirmSelect(buf);
      case 5570571:
        return decodeConfirmSelectOk(buf);
      case 60:
        return decodeBasicProperties(buf);
      default:
        throw new Error("Unknown class/method ID");
    }
  };
  exports.encodeMethod = function(id, channel, fields) {
    switch (id) {
      case 3932170:
        return encodeBasicQos(channel, fields);
      case 3932171:
        return encodeBasicQosOk(channel, fields);
      case 3932180:
        return encodeBasicConsume(channel, fields);
      case 3932181:
        return encodeBasicConsumeOk(channel, fields);
      case 3932190:
        return encodeBasicCancel(channel, fields);
      case 3932191:
        return encodeBasicCancelOk(channel, fields);
      case 3932200:
        return encodeBasicPublish(channel, fields);
      case 3932210:
        return encodeBasicReturn(channel, fields);
      case 3932220:
        return encodeBasicDeliver(channel, fields);
      case 3932230:
        return encodeBasicGet(channel, fields);
      case 3932231:
        return encodeBasicGetOk(channel, fields);
      case 3932232:
        return encodeBasicGetEmpty(channel, fields);
      case 3932240:
        return encodeBasicAck(channel, fields);
      case 3932250:
        return encodeBasicReject(channel, fields);
      case 3932260:
        return encodeBasicRecoverAsync(channel, fields);
      case 3932270:
        return encodeBasicRecover(channel, fields);
      case 3932271:
        return encodeBasicRecoverOk(channel, fields);
      case 3932280:
        return encodeBasicNack(channel, fields);
      case 655370:
        return encodeConnectionStart(channel, fields);
      case 655371:
        return encodeConnectionStartOk(channel, fields);
      case 655380:
        return encodeConnectionSecure(channel, fields);
      case 655381:
        return encodeConnectionSecureOk(channel, fields);
      case 655390:
        return encodeConnectionTune(channel, fields);
      case 655391:
        return encodeConnectionTuneOk(channel, fields);
      case 655400:
        return encodeConnectionOpen(channel, fields);
      case 655401:
        return encodeConnectionOpenOk(channel, fields);
      case 655410:
        return encodeConnectionClose(channel, fields);
      case 655411:
        return encodeConnectionCloseOk(channel, fields);
      case 655420:
        return encodeConnectionBlocked(channel, fields);
      case 655421:
        return encodeConnectionUnblocked(channel, fields);
      case 655430:
        return encodeConnectionUpdateSecret(channel, fields);
      case 655431:
        return encodeConnectionUpdateSecretOk(channel, fields);
      case 1310730:
        return encodeChannelOpen(channel, fields);
      case 1310731:
        return encodeChannelOpenOk(channel, fields);
      case 1310740:
        return encodeChannelFlow(channel, fields);
      case 1310741:
        return encodeChannelFlowOk(channel, fields);
      case 1310760:
        return encodeChannelClose(channel, fields);
      case 1310761:
        return encodeChannelCloseOk(channel, fields);
      case 1966090:
        return encodeAccessRequest(channel, fields);
      case 1966091:
        return encodeAccessRequestOk(channel, fields);
      case 2621450:
        return encodeExchangeDeclare(channel, fields);
      case 2621451:
        return encodeExchangeDeclareOk(channel, fields);
      case 2621460:
        return encodeExchangeDelete(channel, fields);
      case 2621461:
        return encodeExchangeDeleteOk(channel, fields);
      case 2621470:
        return encodeExchangeBind(channel, fields);
      case 2621471:
        return encodeExchangeBindOk(channel, fields);
      case 2621480:
        return encodeExchangeUnbind(channel, fields);
      case 2621491:
        return encodeExchangeUnbindOk(channel, fields);
      case 3276810:
        return encodeQueueDeclare(channel, fields);
      case 3276811:
        return encodeQueueDeclareOk(channel, fields);
      case 3276820:
        return encodeQueueBind(channel, fields);
      case 3276821:
        return encodeQueueBindOk(channel, fields);
      case 3276830:
        return encodeQueuePurge(channel, fields);
      case 3276831:
        return encodeQueuePurgeOk(channel, fields);
      case 3276840:
        return encodeQueueDelete(channel, fields);
      case 3276841:
        return encodeQueueDeleteOk(channel, fields);
      case 3276850:
        return encodeQueueUnbind(channel, fields);
      case 3276851:
        return encodeQueueUnbindOk(channel, fields);
      case 5898250:
        return encodeTxSelect(channel, fields);
      case 5898251:
        return encodeTxSelectOk(channel, fields);
      case 5898260:
        return encodeTxCommit(channel, fields);
      case 5898261:
        return encodeTxCommitOk(channel, fields);
      case 5898270:
        return encodeTxRollback(channel, fields);
      case 5898271:
        return encodeTxRollbackOk(channel, fields);
      case 5570570:
        return encodeConfirmSelect(channel, fields);
      case 5570571:
        return encodeConfirmSelectOk(channel, fields);
      default:
        throw new Error("Unknown class/method ID");
    }
  };
  exports.encodeProperties = function(id, channel, size, fields) {
    switch (id) {
      case 60:
        return encodeBasicProperties(channel, size, fields);
      default:
        throw new Error("Unknown class/properties ID");
    }
  };
  exports.info = function(id) {
    switch (id) {
      case 3932170:
        return methodInfoBasicQos;
      case 3932171:
        return methodInfoBasicQosOk;
      case 3932180:
        return methodInfoBasicConsume;
      case 3932181:
        return methodInfoBasicConsumeOk;
      case 3932190:
        return methodInfoBasicCancel;
      case 3932191:
        return methodInfoBasicCancelOk;
      case 3932200:
        return methodInfoBasicPublish;
      case 3932210:
        return methodInfoBasicReturn;
      case 3932220:
        return methodInfoBasicDeliver;
      case 3932230:
        return methodInfoBasicGet;
      case 3932231:
        return methodInfoBasicGetOk;
      case 3932232:
        return methodInfoBasicGetEmpty;
      case 3932240:
        return methodInfoBasicAck;
      case 3932250:
        return methodInfoBasicReject;
      case 3932260:
        return methodInfoBasicRecoverAsync;
      case 3932270:
        return methodInfoBasicRecover;
      case 3932271:
        return methodInfoBasicRecoverOk;
      case 3932280:
        return methodInfoBasicNack;
      case 655370:
        return methodInfoConnectionStart;
      case 655371:
        return methodInfoConnectionStartOk;
      case 655380:
        return methodInfoConnectionSecure;
      case 655381:
        return methodInfoConnectionSecureOk;
      case 655390:
        return methodInfoConnectionTune;
      case 655391:
        return methodInfoConnectionTuneOk;
      case 655400:
        return methodInfoConnectionOpen;
      case 655401:
        return methodInfoConnectionOpenOk;
      case 655410:
        return methodInfoConnectionClose;
      case 655411:
        return methodInfoConnectionCloseOk;
      case 655420:
        return methodInfoConnectionBlocked;
      case 655421:
        return methodInfoConnectionUnblocked;
      case 655430:
        return methodInfoConnectionUpdateSecret;
      case 655431:
        return methodInfoConnectionUpdateSecretOk;
      case 1310730:
        return methodInfoChannelOpen;
      case 1310731:
        return methodInfoChannelOpenOk;
      case 1310740:
        return methodInfoChannelFlow;
      case 1310741:
        return methodInfoChannelFlowOk;
      case 1310760:
        return methodInfoChannelClose;
      case 1310761:
        return methodInfoChannelCloseOk;
      case 1966090:
        return methodInfoAccessRequest;
      case 1966091:
        return methodInfoAccessRequestOk;
      case 2621450:
        return methodInfoExchangeDeclare;
      case 2621451:
        return methodInfoExchangeDeclareOk;
      case 2621460:
        return methodInfoExchangeDelete;
      case 2621461:
        return methodInfoExchangeDeleteOk;
      case 2621470:
        return methodInfoExchangeBind;
      case 2621471:
        return methodInfoExchangeBindOk;
      case 2621480:
        return methodInfoExchangeUnbind;
      case 2621491:
        return methodInfoExchangeUnbindOk;
      case 3276810:
        return methodInfoQueueDeclare;
      case 3276811:
        return methodInfoQueueDeclareOk;
      case 3276820:
        return methodInfoQueueBind;
      case 3276821:
        return methodInfoQueueBindOk;
      case 3276830:
        return methodInfoQueuePurge;
      case 3276831:
        return methodInfoQueuePurgeOk;
      case 3276840:
        return methodInfoQueueDelete;
      case 3276841:
        return methodInfoQueueDeleteOk;
      case 3276850:
        return methodInfoQueueUnbind;
      case 3276851:
        return methodInfoQueueUnbindOk;
      case 5898250:
        return methodInfoTxSelect;
      case 5898251:
        return methodInfoTxSelectOk;
      case 5898260:
        return methodInfoTxCommit;
      case 5898261:
        return methodInfoTxCommitOk;
      case 5898270:
        return methodInfoTxRollback;
      case 5898271:
        return methodInfoTxRollbackOk;
      case 5570570:
        return methodInfoConfirmSelect;
      case 5570571:
        return methodInfoConfirmSelectOk;
      case 60:
        return propertiesInfoBasicProperties;
      default:
        throw new Error("Unknown class/method ID");
    }
  };
  exports.BasicQos = 3932170;
  var methodInfoBasicQos = exports.methodInfoBasicQos = {
    id: 3932170,
    classId: 60,
    methodId: 10,
    name: "BasicQos",
    args: [{
      type: "long",
      name: "prefetchSize",
      default: 0
    }, {
      type: "short",
      name: "prefetchCount",
      default: 0
    }, {
      type: "bit",
      name: "global",
      default: false
    }]
  };
  exports.BasicQosOk = 3932171;
  var methodInfoBasicQosOk = exports.methodInfoBasicQosOk = {
    id: 3932171,
    classId: 60,
    methodId: 11,
    name: "BasicQosOk",
    args: []
  };
  exports.BasicConsume = 3932180;
  var methodInfoBasicConsume = exports.methodInfoBasicConsume = {
    id: 3932180,
    classId: 60,
    methodId: 20,
    name: "BasicConsume",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "shortstr",
      name: "consumerTag",
      default: ""
    }, {
      type: "bit",
      name: "noLocal",
      default: false
    }, {
      type: "bit",
      name: "noAck",
      default: false
    }, {
      type: "bit",
      name: "exclusive",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.BasicConsumeOk = 3932181;
  var methodInfoBasicConsumeOk = exports.methodInfoBasicConsumeOk = {
    id: 3932181,
    classId: 60,
    methodId: 21,
    name: "BasicConsumeOk",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }]
  };
  exports.BasicCancel = 3932190;
  var methodInfoBasicCancel = exports.methodInfoBasicCancel = {
    id: 3932190,
    classId: 60,
    methodId: 30,
    name: "BasicCancel",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.BasicCancelOk = 3932191;
  var methodInfoBasicCancelOk = exports.methodInfoBasicCancelOk = {
    id: 3932191,
    classId: 60,
    methodId: 31,
    name: "BasicCancelOk",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }]
  };
  exports.BasicPublish = 3932200;
  var methodInfoBasicPublish = exports.methodInfoBasicPublish = {
    id: 3932200,
    classId: 60,
    methodId: 40,
    name: "BasicPublish",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "exchange",
      default: ""
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "mandatory",
      default: false
    }, {
      type: "bit",
      name: "immediate",
      default: false
    }]
  };
  exports.BasicReturn = 3932210;
  var methodInfoBasicReturn = exports.methodInfoBasicReturn = {
    id: 3932210,
    classId: 60,
    methodId: 50,
    name: "BasicReturn",
    args: [{
      type: "short",
      name: "replyCode"
    }, {
      type: "shortstr",
      name: "replyText",
      default: ""
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey"
    }]
  };
  exports.BasicDeliver = 3932220;
  var methodInfoBasicDeliver = exports.methodInfoBasicDeliver = {
    id: 3932220,
    classId: 60,
    methodId: 60,
    name: "BasicDeliver",
    args: [{
      type: "shortstr",
      name: "consumerTag"
    }, {
      type: "longlong",
      name: "deliveryTag"
    }, {
      type: "bit",
      name: "redelivered",
      default: false
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey"
    }]
  };
  exports.BasicGet = 3932230;
  var methodInfoBasicGet = exports.methodInfoBasicGet = {
    id: 3932230,
    classId: 60,
    methodId: 70,
    name: "BasicGet",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "noAck",
      default: false
    }]
  };
  exports.BasicGetOk = 3932231;
  var methodInfoBasicGetOk = exports.methodInfoBasicGetOk = {
    id: 3932231,
    classId: 60,
    methodId: 71,
    name: "BasicGetOk",
    args: [{
      type: "longlong",
      name: "deliveryTag"
    }, {
      type: "bit",
      name: "redelivered",
      default: false
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey"
    }, {
      type: "long",
      name: "messageCount"
    }]
  };
  exports.BasicGetEmpty = 3932232;
  var methodInfoBasicGetEmpty = exports.methodInfoBasicGetEmpty = {
    id: 3932232,
    classId: 60,
    methodId: 72,
    name: "BasicGetEmpty",
    args: [{
      type: "shortstr",
      name: "clusterId",
      default: ""
    }]
  };
  exports.BasicAck = 3932240;
  var methodInfoBasicAck = exports.methodInfoBasicAck = {
    id: 3932240,
    classId: 60,
    methodId: 80,
    name: "BasicAck",
    args: [{
      type: "longlong",
      name: "deliveryTag",
      default: 0
    }, {
      type: "bit",
      name: "multiple",
      default: false
    }]
  };
  exports.BasicReject = 3932250;
  var methodInfoBasicReject = exports.methodInfoBasicReject = {
    id: 3932250,
    classId: 60,
    methodId: 90,
    name: "BasicReject",
    args: [{
      type: "longlong",
      name: "deliveryTag"
    }, {
      type: "bit",
      name: "requeue",
      default: true
    }]
  };
  exports.BasicRecoverAsync = 3932260;
  var methodInfoBasicRecoverAsync = exports.methodInfoBasicRecoverAsync = {
    id: 3932260,
    classId: 60,
    methodId: 100,
    name: "BasicRecoverAsync",
    args: [{
      type: "bit",
      name: "requeue",
      default: false
    }]
  };
  exports.BasicRecover = 3932270;
  var methodInfoBasicRecover = exports.methodInfoBasicRecover = {
    id: 3932270,
    classId: 60,
    methodId: 110,
    name: "BasicRecover",
    args: [{
      type: "bit",
      name: "requeue",
      default: false
    }]
  };
  exports.BasicRecoverOk = 3932271;
  var methodInfoBasicRecoverOk = exports.methodInfoBasicRecoverOk = {
    id: 3932271,
    classId: 60,
    methodId: 111,
    name: "BasicRecoverOk",
    args: []
  };
  exports.BasicNack = 3932280;
  var methodInfoBasicNack = exports.methodInfoBasicNack = {
    id: 3932280,
    classId: 60,
    methodId: 120,
    name: "BasicNack",
    args: [{
      type: "longlong",
      name: "deliveryTag",
      default: 0
    }, {
      type: "bit",
      name: "multiple",
      default: false
    }, {
      type: "bit",
      name: "requeue",
      default: true
    }]
  };
  exports.ConnectionStart = 655370;
  var methodInfoConnectionStart = exports.methodInfoConnectionStart = {
    id: 655370,
    classId: 10,
    methodId: 10,
    name: "ConnectionStart",
    args: [{
      type: "octet",
      name: "versionMajor",
      default: 0
    }, {
      type: "octet",
      name: "versionMinor",
      default: 9
    }, {
      type: "table",
      name: "serverProperties"
    }, {
      type: "longstr",
      name: "mechanisms",
      default: "PLAIN"
    }, {
      type: "longstr",
      name: "locales",
      default: "en_US"
    }]
  };
  exports.ConnectionStartOk = 655371;
  var methodInfoConnectionStartOk = exports.methodInfoConnectionStartOk = {
    id: 655371,
    classId: 10,
    methodId: 11,
    name: "ConnectionStartOk",
    args: [{
      type: "table",
      name: "clientProperties"
    }, {
      type: "shortstr",
      name: "mechanism",
      default: "PLAIN"
    }, {
      type: "longstr",
      name: "response"
    }, {
      type: "shortstr",
      name: "locale",
      default: "en_US"
    }]
  };
  exports.ConnectionSecure = 655380;
  var methodInfoConnectionSecure = exports.methodInfoConnectionSecure = {
    id: 655380,
    classId: 10,
    methodId: 20,
    name: "ConnectionSecure",
    args: [{
      type: "longstr",
      name: "challenge"
    }]
  };
  exports.ConnectionSecureOk = 655381;
  var methodInfoConnectionSecureOk = exports.methodInfoConnectionSecureOk = {
    id: 655381,
    classId: 10,
    methodId: 21,
    name: "ConnectionSecureOk",
    args: [{
      type: "longstr",
      name: "response"
    }]
  };
  exports.ConnectionTune = 655390;
  var methodInfoConnectionTune = exports.methodInfoConnectionTune = {
    id: 655390,
    classId: 10,
    methodId: 30,
    name: "ConnectionTune",
    args: [{
      type: "short",
      name: "channelMax",
      default: 0
    }, {
      type: "long",
      name: "frameMax",
      default: 0
    }, {
      type: "short",
      name: "heartbeat",
      default: 0
    }]
  };
  exports.ConnectionTuneOk = 655391;
  var methodInfoConnectionTuneOk = exports.methodInfoConnectionTuneOk = {
    id: 655391,
    classId: 10,
    methodId: 31,
    name: "ConnectionTuneOk",
    args: [{
      type: "short",
      name: "channelMax",
      default: 0
    }, {
      type: "long",
      name: "frameMax",
      default: 0
    }, {
      type: "short",
      name: "heartbeat",
      default: 0
    }]
  };
  exports.ConnectionOpen = 655400;
  var methodInfoConnectionOpen = exports.methodInfoConnectionOpen = {
    id: 655400,
    classId: 10,
    methodId: 40,
    name: "ConnectionOpen",
    args: [{
      type: "shortstr",
      name: "virtualHost",
      default: "/"
    }, {
      type: "shortstr",
      name: "capabilities",
      default: ""
    }, {
      type: "bit",
      name: "insist",
      default: false
    }]
  };
  exports.ConnectionOpenOk = 655401;
  var methodInfoConnectionOpenOk = exports.methodInfoConnectionOpenOk = {
    id: 655401,
    classId: 10,
    methodId: 41,
    name: "ConnectionOpenOk",
    args: [{
      type: "shortstr",
      name: "knownHosts",
      default: ""
    }]
  };
  exports.ConnectionClose = 655410;
  var methodInfoConnectionClose = exports.methodInfoConnectionClose = {
    id: 655410,
    classId: 10,
    methodId: 50,
    name: "ConnectionClose",
    args: [{
      type: "short",
      name: "replyCode"
    }, {
      type: "shortstr",
      name: "replyText",
      default: ""
    }, {
      type: "short",
      name: "classId"
    }, {
      type: "short",
      name: "methodId"
    }]
  };
  exports.ConnectionCloseOk = 655411;
  var methodInfoConnectionCloseOk = exports.methodInfoConnectionCloseOk = {
    id: 655411,
    classId: 10,
    methodId: 51,
    name: "ConnectionCloseOk",
    args: []
  };
  exports.ConnectionBlocked = 655420;
  var methodInfoConnectionBlocked = exports.methodInfoConnectionBlocked = {
    id: 655420,
    classId: 10,
    methodId: 60,
    name: "ConnectionBlocked",
    args: [{
      type: "shortstr",
      name: "reason",
      default: ""
    }]
  };
  exports.ConnectionUnblocked = 655421;
  var methodInfoConnectionUnblocked = exports.methodInfoConnectionUnblocked = {
    id: 655421,
    classId: 10,
    methodId: 61,
    name: "ConnectionUnblocked",
    args: []
  };
  exports.ConnectionUpdateSecret = 655430;
  var methodInfoConnectionUpdateSecret = exports.methodInfoConnectionUpdateSecret = {
    id: 655430,
    classId: 10,
    methodId: 70,
    name: "ConnectionUpdateSecret",
    args: [{
      type: "longstr",
      name: "newSecret"
    }, {
      type: "shortstr",
      name: "reason"
    }]
  };
  exports.ConnectionUpdateSecretOk = 655431;
  var methodInfoConnectionUpdateSecretOk = exports.methodInfoConnectionUpdateSecretOk = {
    id: 655431,
    classId: 10,
    methodId: 71,
    name: "ConnectionUpdateSecretOk",
    args: []
  };
  exports.ChannelOpen = 1310730;
  var methodInfoChannelOpen = exports.methodInfoChannelOpen = {
    id: 1310730,
    classId: 20,
    methodId: 10,
    name: "ChannelOpen",
    args: [{
      type: "shortstr",
      name: "outOfBand",
      default: ""
    }]
  };
  exports.ChannelOpenOk = 1310731;
  var methodInfoChannelOpenOk = exports.methodInfoChannelOpenOk = {
    id: 1310731,
    classId: 20,
    methodId: 11,
    name: "ChannelOpenOk",
    args: [{
      type: "longstr",
      name: "channelId",
      default: ""
    }]
  };
  exports.ChannelFlow = 1310740;
  var methodInfoChannelFlow = exports.methodInfoChannelFlow = {
    id: 1310740,
    classId: 20,
    methodId: 20,
    name: "ChannelFlow",
    args: [{
      type: "bit",
      name: "active"
    }]
  };
  exports.ChannelFlowOk = 1310741;
  var methodInfoChannelFlowOk = exports.methodInfoChannelFlowOk = {
    id: 1310741,
    classId: 20,
    methodId: 21,
    name: "ChannelFlowOk",
    args: [{
      type: "bit",
      name: "active"
    }]
  };
  exports.ChannelClose = 1310760;
  var methodInfoChannelClose = exports.methodInfoChannelClose = {
    id: 1310760,
    classId: 20,
    methodId: 40,
    name: "ChannelClose",
    args: [{
      type: "short",
      name: "replyCode"
    }, {
      type: "shortstr",
      name: "replyText",
      default: ""
    }, {
      type: "short",
      name: "classId"
    }, {
      type: "short",
      name: "methodId"
    }]
  };
  exports.ChannelCloseOk = 1310761;
  var methodInfoChannelCloseOk = exports.methodInfoChannelCloseOk = {
    id: 1310761,
    classId: 20,
    methodId: 41,
    name: "ChannelCloseOk",
    args: []
  };
  exports.AccessRequest = 1966090;
  var methodInfoAccessRequest = exports.methodInfoAccessRequest = {
    id: 1966090,
    classId: 30,
    methodId: 10,
    name: "AccessRequest",
    args: [{
      type: "shortstr",
      name: "realm",
      default: "/data"
    }, {
      type: "bit",
      name: "exclusive",
      default: false
    }, {
      type: "bit",
      name: "passive",
      default: true
    }, {
      type: "bit",
      name: "active",
      default: true
    }, {
      type: "bit",
      name: "write",
      default: true
    }, {
      type: "bit",
      name: "read",
      default: true
    }]
  };
  exports.AccessRequestOk = 1966091;
  var methodInfoAccessRequestOk = exports.methodInfoAccessRequestOk = {
    id: 1966091,
    classId: 30,
    methodId: 11,
    name: "AccessRequestOk",
    args: [{
      type: "short",
      name: "ticket",
      default: 1
    }]
  };
  exports.ExchangeDeclare = 2621450;
  var methodInfoExchangeDeclare = exports.methodInfoExchangeDeclare = {
    id: 2621450,
    classId: 40,
    methodId: 10,
    name: "ExchangeDeclare",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "type",
      default: "direct"
    }, {
      type: "bit",
      name: "passive",
      default: false
    }, {
      type: "bit",
      name: "durable",
      default: false
    }, {
      type: "bit",
      name: "autoDelete",
      default: false
    }, {
      type: "bit",
      name: "internal",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.ExchangeDeclareOk = 2621451;
  var methodInfoExchangeDeclareOk = exports.methodInfoExchangeDeclareOk = {
    id: 2621451,
    classId: 40,
    methodId: 11,
    name: "ExchangeDeclareOk",
    args: []
  };
  exports.ExchangeDelete = 2621460;
  var methodInfoExchangeDelete = exports.methodInfoExchangeDelete = {
    id: 2621460,
    classId: 40,
    methodId: 20,
    name: "ExchangeDelete",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "bit",
      name: "ifUnused",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.ExchangeDeleteOk = 2621461;
  var methodInfoExchangeDeleteOk = exports.methodInfoExchangeDeleteOk = {
    id: 2621461,
    classId: 40,
    methodId: 21,
    name: "ExchangeDeleteOk",
    args: []
  };
  exports.ExchangeBind = 2621470;
  var methodInfoExchangeBind = exports.methodInfoExchangeBind = {
    id: 2621470,
    classId: 40,
    methodId: 30,
    name: "ExchangeBind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "destination"
    }, {
      type: "shortstr",
      name: "source"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.ExchangeBindOk = 2621471;
  var methodInfoExchangeBindOk = exports.methodInfoExchangeBindOk = {
    id: 2621471,
    classId: 40,
    methodId: 31,
    name: "ExchangeBindOk",
    args: []
  };
  exports.ExchangeUnbind = 2621480;
  var methodInfoExchangeUnbind = exports.methodInfoExchangeUnbind = {
    id: 2621480,
    classId: 40,
    methodId: 40,
    name: "ExchangeUnbind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "destination"
    }, {
      type: "shortstr",
      name: "source"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.ExchangeUnbindOk = 2621491;
  var methodInfoExchangeUnbindOk = exports.methodInfoExchangeUnbindOk = {
    id: 2621491,
    classId: 40,
    methodId: 51,
    name: "ExchangeUnbindOk",
    args: []
  };
  exports.QueueDeclare = 3276810;
  var methodInfoQueueDeclare = exports.methodInfoQueueDeclare = {
    id: 3276810,
    classId: 50,
    methodId: 10,
    name: "QueueDeclare",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "passive",
      default: false
    }, {
      type: "bit",
      name: "durable",
      default: false
    }, {
      type: "bit",
      name: "exclusive",
      default: false
    }, {
      type: "bit",
      name: "autoDelete",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.QueueDeclareOk = 3276811;
  var methodInfoQueueDeclareOk = exports.methodInfoQueueDeclareOk = {
    id: 3276811,
    classId: 50,
    methodId: 11,
    name: "QueueDeclareOk",
    args: [{
      type: "shortstr",
      name: "queue"
    }, {
      type: "long",
      name: "messageCount"
    }, {
      type: "long",
      name: "consumerCount"
    }]
  };
  exports.QueueBind = 3276820;
  var methodInfoQueueBind = exports.methodInfoQueueBind = {
    id: 3276820,
    classId: 50,
    methodId: 20,
    name: "QueueBind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.QueueBindOk = 3276821;
  var methodInfoQueueBindOk = exports.methodInfoQueueBindOk = {
    id: 3276821,
    classId: 50,
    methodId: 21,
    name: "QueueBindOk",
    args: []
  };
  exports.QueuePurge = 3276830;
  var methodInfoQueuePurge = exports.methodInfoQueuePurge = {
    id: 3276830,
    classId: 50,
    methodId: 30,
    name: "QueuePurge",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.QueuePurgeOk = 3276831;
  var methodInfoQueuePurgeOk = exports.methodInfoQueuePurgeOk = {
    id: 3276831,
    classId: 50,
    methodId: 31,
    name: "QueuePurgeOk",
    args: [{
      type: "long",
      name: "messageCount"
    }]
  };
  exports.QueueDelete = 3276840;
  var methodInfoQueueDelete = exports.methodInfoQueueDelete = {
    id: 3276840,
    classId: 50,
    methodId: 40,
    name: "QueueDelete",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "bit",
      name: "ifUnused",
      default: false
    }, {
      type: "bit",
      name: "ifEmpty",
      default: false
    }, {
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.QueueDeleteOk = 3276841;
  var methodInfoQueueDeleteOk = exports.methodInfoQueueDeleteOk = {
    id: 3276841,
    classId: 50,
    methodId: 41,
    name: "QueueDeleteOk",
    args: [{
      type: "long",
      name: "messageCount"
    }]
  };
  exports.QueueUnbind = 3276850;
  var methodInfoQueueUnbind = exports.methodInfoQueueUnbind = {
    id: 3276850,
    classId: 50,
    methodId: 50,
    name: "QueueUnbind",
    args: [{
      type: "short",
      name: "ticket",
      default: 0
    }, {
      type: "shortstr",
      name: "queue",
      default: ""
    }, {
      type: "shortstr",
      name: "exchange"
    }, {
      type: "shortstr",
      name: "routingKey",
      default: ""
    }, {
      type: "table",
      name: "arguments",
      default: {}
    }]
  };
  exports.QueueUnbindOk = 3276851;
  var methodInfoQueueUnbindOk = exports.methodInfoQueueUnbindOk = {
    id: 3276851,
    classId: 50,
    methodId: 51,
    name: "QueueUnbindOk",
    args: []
  };
  exports.TxSelect = 5898250;
  var methodInfoTxSelect = exports.methodInfoTxSelect = {
    id: 5898250,
    classId: 90,
    methodId: 10,
    name: "TxSelect",
    args: []
  };
  exports.TxSelectOk = 5898251;
  var methodInfoTxSelectOk = exports.methodInfoTxSelectOk = {
    id: 5898251,
    classId: 90,
    methodId: 11,
    name: "TxSelectOk",
    args: []
  };
  exports.TxCommit = 5898260;
  var methodInfoTxCommit = exports.methodInfoTxCommit = {
    id: 5898260,
    classId: 90,
    methodId: 20,
    name: "TxCommit",
    args: []
  };
  exports.TxCommitOk = 5898261;
  var methodInfoTxCommitOk = exports.methodInfoTxCommitOk = {
    id: 5898261,
    classId: 90,
    methodId: 21,
    name: "TxCommitOk",
    args: []
  };
  exports.TxRollback = 5898270;
  var methodInfoTxRollback = exports.methodInfoTxRollback = {
    id: 5898270,
    classId: 90,
    methodId: 30,
    name: "TxRollback",
    args: []
  };
  exports.TxRollbackOk = 5898271;
  var methodInfoTxRollbackOk = exports.methodInfoTxRollbackOk = {
    id: 5898271,
    classId: 90,
    methodId: 31,
    name: "TxRollbackOk",
    args: []
  };
  exports.ConfirmSelect = 5570570;
  var methodInfoConfirmSelect = exports.methodInfoConfirmSelect = {
    id: 5570570,
    classId: 85,
    methodId: 10,
    name: "ConfirmSelect",
    args: [{
      type: "bit",
      name: "nowait",
      default: false
    }]
  };
  exports.ConfirmSelectOk = 5570571;
  var methodInfoConfirmSelectOk = exports.methodInfoConfirmSelectOk = {
    id: 5570571,
    classId: 85,
    methodId: 11,
    name: "ConfirmSelectOk",
    args: []
  };
  exports.BasicProperties = 60;
  var propertiesInfoBasicProperties = exports.propertiesInfoBasicProperties = {
    id: 60,
    name: "BasicProperties",
    args: [{
      type: "shortstr",
      name: "contentType"
    }, {
      type: "shortstr",
      name: "contentEncoding"
    }, {
      type: "table",
      name: "headers"
    }, {
      type: "octet",
      name: "deliveryMode"
    }, {
      type: "octet",
      name: "priority"
    }, {
      type: "shortstr",
      name: "correlationId"
    }, {
      type: "shortstr",
      name: "replyTo"
    }, {
      type: "shortstr",
      name: "expiration"
    }, {
      type: "shortstr",
      name: "messageId"
    }, {
      type: "timestamp",
      name: "timestamp"
    }, {
      type: "shortstr",
      name: "type"
    }, {
      type: "shortstr",
      name: "userId"
    }, {
      type: "shortstr",
      name: "appId"
    }, {
      type: "shortstr",
      name: "clusterId"
    }]
  };
});

// node_modules/amqplib/lib/frame.js
var require_frame = __commonJS((exports, module) => {
  var ints = require_buffer_more_ints();
  var defs = require_defs();
  var constants = defs.constants;
  var decode = defs.decode;
  exports.PROTOCOL_HEADER = "AMQP" + String.fromCharCode(0, 0, 9, 1);
  var FRAME_METHOD = constants.FRAME_METHOD;
  var FRAME_HEARTBEAT = constants.FRAME_HEARTBEAT;
  var FRAME_HEADER = constants.FRAME_HEADER;
  var FRAME_BODY = constants.FRAME_BODY;
  var FRAME_END = constants.FRAME_END;
  var TYPE_BYTES = 1;
  var CHANNEL_BYTES = 2;
  var SIZE_BYTES = 4;
  var FRAME_HEADER_BYTES = TYPE_BYTES + CHANNEL_BYTES + SIZE_BYTES;
  var FRAME_END_BYTES = 1;
  function readInt64BE(buffer, offset) {
    if (typeof Buffer.prototype.readBigInt64BE === "function") {
      return Number(buffer.readBigInt64BE(offset));
    }
    return ints.readInt64BE(buffer, offset);
  }
  exports.makeBodyFrame = function(channel, payload) {
    const frameSize = FRAME_HEADER_BYTES + payload.length + FRAME_END_BYTES;
    const frame = Buffer.alloc(frameSize);
    let offset = 0;
    offset = frame.writeUInt8(FRAME_BODY, offset);
    offset = frame.writeUInt16BE(channel, offset);
    offset = frame.writeInt32BE(payload.length, offset);
    payload.copy(frame, offset);
    offset += payload.length;
    frame.writeUInt8(FRAME_END, offset);
    return frame;
  };
  function parseFrame(bin) {
    if (bin.length < FRAME_HEADER_BYTES) {
      return false;
    }
    const type = bin.readUInt8(0);
    const channel = bin.readUInt16BE(1);
    const size = bin.readUInt32BE(3);
    const totalSize = FRAME_HEADER_BYTES + size + FRAME_END_BYTES;
    if (bin.length < totalSize) {
      return false;
    }
    const frameEnd = bin.readUInt8(FRAME_HEADER_BYTES + size);
    if (frameEnd !== FRAME_END) {
      throw new Error("Invalid frame");
    }
    return {
      type,
      channel,
      size,
      payload: bin.subarray(FRAME_HEADER_BYTES, FRAME_HEADER_BYTES + size),
      rest: bin.subarray(totalSize)
    };
  }
  exports.parseFrame = parseFrame;
  var HEARTBEAT = { channel: 0 };
  exports.decodeFrame = (frame) => {
    const payload = frame.payload;
    const channel = frame.channel;
    switch (frame.type) {
      case FRAME_METHOD: {
        const id = payload.readUInt32BE(0);
        const args = payload.subarray(4);
        const fields = decode(id, args);
        return { id, channel, fields };
      }
      case FRAME_HEADER: {
        const id = payload.readUInt16BE(0);
        const size = readInt64BE(payload, 4);
        const flagsAndfields = payload.subarray(12);
        const fields = decode(id, flagsAndfields);
        return { id, channel, size, fields };
      }
      case FRAME_BODY:
        return { channel, content: payload };
      case FRAME_HEARTBEAT:
        return HEARTBEAT;
      default:
        throw new Error("Unknown frame type " + frame.type);
    }
  };
  exports.HEARTBEAT_BUF = Buffer.from([
    constants.FRAME_HEARTBEAT,
    0,
    0,
    0,
    0,
    0,
    0,
    constants.FRAME_END
  ]);
  exports.HEARTBEAT = HEARTBEAT;
});

// node_modules/amqplib/lib/mux.js
var require_mux = __commonJS((exports, module) => {
  var assert = __require("assert");
  var schedule = typeof setImmediate === "function" ? setImmediate : process.nextTick;

  class Mux {
    constructor(downstream) {
      this.newStreams = [];
      this.oldStreams = [];
      this.blocked = false;
      this.scheduledRead = false;
      this.out = downstream;
      var self2 = this;
      downstream.on("drain", function() {
        self2.blocked = false;
        self2._readIncoming();
      });
    }
    _readIncoming() {
      if (this.blocked)
        return;
      var accepting = true;
      var out = this.out;
      function roundrobin(streams) {
        var s;
        while (accepting && (s = streams.shift())) {
          var chunk = s.read();
          if (chunk !== null) {
            accepting = out.write(chunk);
            streams.push(s);
          }
        }
      }
      roundrobin(this.newStreams);
      if (accepting) {
        assert.equal(0, this.newStreams.length);
        roundrobin(this.oldStreams);
      } else {
        assert(this.newStreams.length > 0, "Expect some new streams to remain");
        Array.prototype.push.apply(this.oldStreams, this.newStreams);
        this.newStreams = [];
      }
      this.blocked = !accepting;
    }
    _scheduleRead() {
      var self2 = this;
      if (!self2.scheduledRead) {
        schedule(function() {
          self2.scheduledRead = false;
          self2._readIncoming();
        });
        self2.scheduledRead = true;
      }
    }
    pipeFrom(readable) {
      var self2 = this;
      function enqueue() {
        self2.newStreams.push(readable);
        self2._scheduleRead();
      }
      function cleanup() {
        readable.removeListener("readable", enqueue);
        readable.removeListener("error", cleanup);
        readable.removeListener("end", cleanup);
        readable.removeListener("unpipeFrom", cleanupIfMe);
      }
      function cleanupIfMe(dest) {
        if (dest === self2)
          cleanup();
      }
      readable.on("unpipeFrom", cleanupIfMe);
      readable.on("end", cleanup);
      readable.on("error", cleanup);
      readable.on("readable", enqueue);
    }
    unpipeFrom(readable) {
      readable.emit("unpipeFrom", this);
    }
  }
  exports.Mux = Mux;
});

// node_modules/amqplib/lib/heartbeat.js
var require_heartbeat = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  exports.UNITS_TO_MS = 1000;

  class Heart extends EventEmitter {
    constructor(interval, checkSend, checkRecv) {
      super();
      this.interval = interval;
      var intervalMs = interval * exports.UNITS_TO_MS;
      var beat = this.emit.bind(this, "beat");
      var timeout = this.emit.bind(this, "timeout");
      this.sendTimer = setInterval(this.runHeartbeat.bind(this, checkSend, beat), intervalMs / 2);
      var recvMissed = 0;
      function missedTwo() {
        if (!checkRecv())
          return ++recvMissed < 2;
        else {
          recvMissed = 0;
          return true;
        }
      }
      this.recvTimer = setInterval(this.runHeartbeat.bind(this, missedTwo, timeout), intervalMs);
    }
    clear() {
      clearInterval(this.sendTimer);
      clearInterval(this.recvTimer);
    }
    runHeartbeat(check, fail) {
      if (!check())
        fail();
    }
  }
  exports.Heart = Heart;
});

// node_modules/amqplib/lib/format.js
var require_format = __commonJS((exports, module) => {
  var defs = require_defs();
  var format = __require("util").format;
  var HEARTBEAT = require_frame().HEARTBEAT;
  exports.closeMessage = function(close) {
    var code = close.fields.replyCode;
    return format('%d (%s) with message "%s"', code, defs.constant_strs[code], close.fields.replyText);
  };
  exports.methodName = function(id) {
    return defs.info(id).name;
  };
  exports.inspect = function(frame, showFields) {
    if (frame === HEARTBEAT) {
      return "<Heartbeat>";
    } else if (!frame.id) {
      return format("<Content channel:%d size:%d>", frame.channel, frame.size);
    } else {
      var info = defs.info(frame.id);
      return format("<%s channel:%d%s>", info.name, frame.channel, showFields ? " " + JSON.stringify(frame.fields, undefined, 2) : "");
    }
  };
});

// node_modules/amqplib/lib/bitset.js
var require_bitset = __commonJS((exports, module) => {
  class BitSet {
    constructor(size) {
      if (size) {
        const numWords = Math.ceil(size / 32);
        this.words = new Array(numWords);
      } else {
        this.words = [];
      }
      this.wordsInUse = 0;
    }
    ensureSize(numWords) {
      const wordsPresent = this.words.length;
      if (wordsPresent < numWords) {
        this.words = this.words.concat(new Array(numWords - wordsPresent));
      }
    }
    set(bitIndex) {
      const w = wordIndex(bitIndex);
      if (w >= this.wordsInUse) {
        this.ensureSize(w + 1);
        this.wordsInUse = w + 1;
      }
      const bit = 1 << bitIndex;
      this.words[w] |= bit;
    }
    clear(bitIndex) {
      const w = wordIndex(bitIndex);
      if (w >= this.wordsInUse)
        return;
      const mask = ~(1 << bitIndex);
      this.words[w] &= mask;
    }
    get(bitIndex) {
      const w = wordIndex(bitIndex);
      if (w >= this.wordsInUse)
        return false;
      const bit = 1 << bitIndex;
      return !!(this.words[w] & bit);
    }
    nextSetBit(fromIndex) {
      let w = wordIndex(fromIndex);
      if (w >= this.wordsInUse)
        return -1;
      let word = this.words[w] & 4294967295 << fromIndex;
      while (true) {
        if (word)
          return w * 32 + trailingZeros(word);
        w++;
        if (w === this.wordsInUse)
          return -1;
        word = this.words[w];
      }
    }
    nextClearBit(fromIndex) {
      let w = wordIndex(fromIndex);
      if (w >= this.wordsInUse)
        return fromIndex;
      let word = ~this.words[w] & 4294967295 << fromIndex;
      while (true) {
        if (word)
          return w * 32 + trailingZeros(word);
        w++;
        if (w == this.wordsInUse)
          return w * 32;
        word = ~this.words[w];
      }
    }
  }
  function wordIndex(bitIndex) {
    return Math.floor(bitIndex / 32);
  }
  function trailingZeros(i) {
    if (i === 0)
      return 32;
    let y, n = 31;
    y = i << 16;
    if (y != 0) {
      n = n - 16;
      i = y;
    }
    y = i << 8;
    if (y != 0) {
      n = n - 8;
      i = y;
    }
    y = i << 4;
    if (y != 0) {
      n = n - 4;
      i = y;
    }
    y = i << 2;
    if (y != 0) {
      n = n - 2;
      i = y;
    }
    return n - (i << 1 >>> 31);
  }
  exports.BitSet = BitSet;
});

// node_modules/amqplib/lib/error.js
var require_error = __commonJS((exports, module) => {
  var inherits = __require("util").inherits;
  function trimStack(stack, num) {
    return stack && stack.split(`
`).slice(num).join(`
`);
  }
  function IllegalOperationError(msg, stack) {
    var tmp = new Error;
    this.message = msg;
    this.stack = this.toString() + `
` + trimStack(tmp.stack, 2);
    this.stackAtStateChange = stack;
  }
  inherits(IllegalOperationError, Error);
  IllegalOperationError.prototype.name = "IllegalOperationError";
  function stackCapture(reason) {
    var e = new Error;
    return "Stack capture: " + reason + `
` + trimStack(e.stack, 2);
  }
  exports.IllegalOperationError = IllegalOperationError;
  exports.stackCapture = stackCapture;
});

// node_modules/amqplib/lib/connection.js
var require_connection = __commonJS((exports, module) => {
  var defs = require_defs();
  var constants = defs.constants;
  var frame = require_frame();
  var HEARTBEAT = frame.HEARTBEAT;
  var Mux = require_mux().Mux;
  var Duplex = __require("stream").Duplex;
  var EventEmitter = __require("events");
  var Heart = require_heartbeat().Heart;
  var methodName = require_format().methodName;
  var closeMsg = require_format().closeMessage;
  var inspect = require_format().inspect;
  var BitSet = require_bitset().BitSet;
  var fmt = __require("util").format;
  var PassThrough = __require("stream").PassThrough;
  var IllegalOperationError = require_error().IllegalOperationError;
  var stackCapture = require_error().stackCapture;
  var DEFAULT_WRITE_HWM = 1024;
  var SINGLE_CHUNK_THRESHOLD = 2048;

  class Connection extends EventEmitter {
    constructor(underlying) {
      super();
      var stream = this.stream = wrapStream(underlying);
      this.muxer = new Mux(stream);
      this.rest = Buffer.alloc(0);
      this.frameMax = constants.FRAME_MIN_SIZE;
      this.sentSinceLastCheck = false;
      this.recvSinceLastCheck = false;
      this.expectSocketClose = false;
      this.freeChannels = new BitSet;
      this.channels = [{
        channel: { accept: channel0(this) },
        buffer: underlying
      }];
    }
    sendProtocolHeader() {
      this.sendBytes(frame.PROTOCOL_HEADER);
    }
    open(allFields, openCallback0) {
      var self2 = this;
      var openCallback = openCallback0 || function() {};
      var tunedOptions = Object.create(allFields);
      function wait(k) {
        self2.step(function(err, frame2) {
          if (err !== null)
            bail(err);
          else if (frame2.channel !== 0) {
            bail(new Error(fmt("Frame on channel != 0 during handshake: %s", inspect(frame2, false))));
          } else
            k(frame2);
        });
      }
      function expect(Method, k) {
        wait(function(frame2) {
          if (frame2.id === Method)
            k(frame2);
          else {
            bail(new Error(fmt("Expected %s; got %s", methodName(Method), inspect(frame2, false))));
          }
        });
      }
      function bail(err) {
        openCallback(err);
      }
      function send(Method) {
        self2.sendMethod(0, Method, tunedOptions);
      }
      function negotiate(server, desired) {
        if (server === 0 || desired === 0) {
          return Math.max(server, desired);
        } else {
          return Math.min(server, desired);
        }
      }
      function onStart(start) {
        var mechanisms = start.fields.mechanisms.toString().split(" ");
        if (mechanisms.indexOf(allFields.mechanism) < 0) {
          bail(new Error(fmt("SASL mechanism %s is not provided by the server", allFields.mechanism)));
          return;
        }
        self2.serverProperties = start.fields.serverProperties;
        try {
          send(defs.ConnectionStartOk);
        } catch (err) {
          bail(err);
          return;
        }
        wait(afterStartOk);
      }
      function afterStartOk(reply) {
        switch (reply.id) {
          case defs.ConnectionSecure:
            bail(new Error("Wasn't expecting to have to go through secure"));
            break;
          case defs.ConnectionClose:
            bail(new Error(fmt("Handshake terminated by server: %s", closeMsg(reply))));
            break;
          case defs.ConnectionTune:
            var fields = reply.fields;
            tunedOptions.frameMax = negotiate(fields.frameMax, allFields.frameMax);
            tunedOptions.channelMax = negotiate(fields.channelMax, allFields.channelMax);
            tunedOptions.heartbeat = negotiate(fields.heartbeat, allFields.heartbeat);
            try {
              send(defs.ConnectionTuneOk);
              send(defs.ConnectionOpen);
            } catch (err) {
              bail(err);
              return;
            }
            expect(defs.ConnectionOpenOk, onOpenOk);
            break;
          default:
            bail(new Error(fmt("Expected connection.secure, connection.close, " + "or connection.tune during handshake; got %s", inspect(reply, false))));
            break;
        }
      }
      function onOpenOk(openOk) {
        self2.channelMax = tunedOptions.channelMax || 65535;
        self2.frameMax = tunedOptions.frameMax || 4294967295;
        self2.heartbeat = tunedOptions.heartbeat;
        self2.heartbeater = self2.startHeartbeater();
        self2.accept = mainAccept;
        succeed(openOk);
      }
      function endWhileOpening(err) {
        bail(err || new Error("Socket closed abruptly " + "during opening handshake"));
      }
      this.stream.on("end", endWhileOpening);
      this.stream.on("error", endWhileOpening);
      function succeed(ok) {
        self2.stream.removeListener("end", endWhileOpening);
        self2.stream.removeListener("error", endWhileOpening);
        self2.stream.on("error", self2.onSocketError.bind(self2));
        self2.stream.on("end", self2.onSocketError.bind(self2, new Error("Unexpected close")));
        self2.on("frameError", self2.onSocketError.bind(self2));
        self2.acceptLoop();
        openCallback(null, ok);
      }
      this.sendProtocolHeader();
      expect(defs.ConnectionStart, onStart);
    }
    close(closeCallback) {
      var k = closeCallback && function() {
        closeCallback(null);
      };
      this.closeBecause("Cheers, thanks", constants.REPLY_SUCCESS, k);
    }
    closeBecause(reason, code, k) {
      this.sendMethod(0, defs.ConnectionClose, {
        replyText: reason,
        replyCode: code,
        methodId: 0,
        classId: 0
      });
      var s = stackCapture("closeBecause called: " + reason);
      this.toClosing(s, k);
    }
    closeWithError(reason, code, error) {
      this.emit("error", error);
      this.closeBecause(reason, code);
    }
    onSocketError(err) {
      if (!this.expectSocketClose) {
        this.expectSocketClose = true;
        this.emit("error", err);
        var s = stackCapture("Socket error");
        this.toClosed(s, err);
      }
    }
    toClosing(capturedStack, k) {
      var send = this.sendMethod.bind(this);
      this.accept = function(f) {
        if (f.id === defs.ConnectionCloseOk) {
          if (k)
            k();
          var s = stackCapture("ConnectionCloseOk received");
          this.toClosed(s, undefined);
        } else if (f.id === defs.ConnectionClose) {
          send(0, defs.ConnectionCloseOk, {});
        }
      };
      invalidateSend(this, "Connection closing", capturedStack);
    }
    _closeChannels(capturedStack) {
      for (var i = 1;i < this.channels.length; i++) {
        var ch = this.channels[i];
        if (ch !== null) {
          ch.channel.toClosed(capturedStack);
        }
      }
    }
    toClosed(capturedStack, maybeErr) {
      this._closeChannels(capturedStack);
      var info = fmt("Connection closed (%s)", maybeErr ? maybeErr.toString() : "by client");
      invalidateSend(this, info, capturedStack);
      this.accept = invalidOp(info, capturedStack);
      this.close = function(cb) {
        cb && cb(new IllegalOperationError(info, capturedStack));
      };
      if (this.heartbeater)
        this.heartbeater.clear();
      this.expectSocketClose = true;
      this.stream.end();
      this.emit("close", maybeErr);
    }
    _updateSecret(newSecret, reason, cb) {
      this.sendMethod(0, defs.ConnectionUpdateSecret, {
        newSecret,
        reason
      });
      this.once("update-secret-ok", cb);
    }
    startHeartbeater() {
      if (this.heartbeat === 0)
        return null;
      else {
        var self2 = this;
        var hb = new Heart(this.heartbeat, this.checkSend.bind(this), this.checkRecv.bind(this));
        hb.on("timeout", function() {
          var hberr = new Error("Heartbeat timeout");
          self2.emit("error", hberr);
          var s = stackCapture("Heartbeat timeout");
          self2.toClosed(s, hberr);
        });
        hb.on("beat", function() {
          self2.sendHeartbeat();
        });
        return hb;
      }
    }
    freshChannel(channel, options) {
      var next = this.freeChannels.nextClearBit(1);
      if (next < 0 || next > this.channelMax)
        throw new Error("No channels left to allocate");
      this.freeChannels.set(next);
      var hwm = options && options.highWaterMark || DEFAULT_WRITE_HWM;
      var writeBuffer = new PassThrough({
        objectMode: true,
        highWaterMark: hwm
      });
      this.channels[next] = { channel, buffer: writeBuffer };
      writeBuffer.on("drain", function() {
        channel.onBufferDrain();
      });
      this.muxer.pipeFrom(writeBuffer);
      return next;
    }
    releaseChannel(channel) {
      this.freeChannels.clear(channel);
      var buffer = this.channels[channel].buffer;
      buffer.end();
      this.channels[channel] = null;
    }
    acceptLoop() {
      var self2 = this;
      function go() {
        try {
          var f;
          while (f = self2.recvFrame())
            self2.accept(f);
        } catch (e) {
          self2.emit("frameError", e);
        }
      }
      self2.stream.on("readable", go);
      go();
    }
    step(cb) {
      var self2 = this;
      function recv() {
        var f;
        try {
          f = self2.recvFrame();
        } catch (e) {
          cb(e, null);
          return;
        }
        if (f)
          cb(null, f);
        else
          self2.stream.once("readable", recv);
      }
      recv();
    }
    checkSend() {
      var check = this.sentSinceLastCheck;
      this.sentSinceLastCheck = false;
      return check;
    }
    checkRecv() {
      var check = this.recvSinceLastCheck;
      this.recvSinceLastCheck = false;
      return check;
    }
    sendBytes(bytes) {
      this.sentSinceLastCheck = true;
      this.stream.write(bytes);
    }
    sendHeartbeat() {
      return this.sendBytes(frame.HEARTBEAT_BUF);
    }
    sendMethod(channel, Method, fields) {
      var frame2 = encodeMethod(Method, channel, fields);
      this.sentSinceLastCheck = true;
      var buffer = this.channels[channel].buffer;
      return buffer.write(frame2);
    }
    sendMessage(channel, Method, fields, Properties, props, content) {
      if (!Buffer.isBuffer(content))
        throw new TypeError("content is not a buffer");
      var mframe = encodeMethod(Method, channel, fields);
      var pframe = encodeProperties(Properties, channel, content.length, props);
      var buffer = this.channels[channel].buffer;
      this.sentSinceLastCheck = true;
      var methodHeaderLen = mframe.length + pframe.length;
      var bodyLen = content.length > 0 ? content.length + FRAME_OVERHEAD : 0;
      var allLen = methodHeaderLen + bodyLen;
      if (allLen < SINGLE_CHUNK_THRESHOLD) {
        var all = Buffer.allocUnsafe(allLen);
        var offset = mframe.copy(all, 0);
        offset += pframe.copy(all, offset);
        if (bodyLen > 0)
          makeBodyFrame(channel, content).copy(all, offset);
        return buffer.write(all);
      } else {
        if (methodHeaderLen < SINGLE_CHUNK_THRESHOLD) {
          var both = Buffer.allocUnsafe(methodHeaderLen);
          var offset = mframe.copy(both, 0);
          pframe.copy(both, offset);
          buffer.write(both);
        } else {
          buffer.write(mframe);
          buffer.write(pframe);
        }
        return this.sendContent(channel, content);
      }
    }
    sendContent(channel, body) {
      if (!Buffer.isBuffer(body)) {
        throw new TypeError(fmt("Expected buffer; got %s", body));
      }
      var writeResult = true;
      var buffer = this.channels[channel].buffer;
      var maxBody = this.frameMax - FRAME_OVERHEAD;
      for (var offset = 0;offset < body.length; offset += maxBody) {
        var end = offset + maxBody;
        var slice = end > body.length ? body.subarray(offset) : body.subarray(offset, end);
        var bodyFrame = makeBodyFrame(channel, slice);
        writeResult = buffer.write(bodyFrame);
      }
      this.sentSinceLastCheck = true;
      return writeResult;
    }
    recvFrame() {
      var frame2 = parseFrame(this.rest);
      if (!frame2) {
        var incoming = this.stream.read();
        if (incoming === null) {
          return false;
        } else {
          this.recvSinceLastCheck = true;
          this.rest = Buffer.concat([this.rest, incoming]);
          return this.recvFrame();
        }
      } else {
        this.rest = frame2.rest;
        return decodeFrame(frame2);
      }
    }
  }
  function mainAccept(frame2) {
    var rec = this.channels[frame2.channel];
    if (rec) {
      return rec.channel.accept(frame2);
    } else
      this.closeWithError(fmt("Frame on unknown channel %d", frame2.channel), constants.CHANNEL_ERROR, new Error(fmt("Frame on unknown channel: %s", inspect(frame2, false))));
  }
  function channel0(connection) {
    return function(f) {
      if (f === HEARTBEAT)
        ;
      else if (f.id === defs.ConnectionClose) {
        connection.sendMethod(0, defs.ConnectionCloseOk, {});
        var emsg = fmt("Connection closed: %s", closeMsg(f));
        var s = stackCapture(emsg);
        var e = new Error(emsg);
        e.code = f.fields.replyCode;
        if (isFatalError(e)) {
          connection.emit("error", e);
        }
        connection.toClosed(s, e);
      } else if (f.id === defs.ConnectionBlocked) {
        connection.emit("blocked", f.fields.reason);
      } else if (f.id === defs.ConnectionUnblocked) {
        connection.emit("unblocked");
      } else if (f.id === defs.ConnectionUpdateSecretOk) {
        connection.emit("update-secret-ok");
      } else {
        connection.closeWithError(fmt("Unexpected frame on channel 0"), constants.UNEXPECTED_FRAME, new Error(fmt("Unexpected frame on channel 0: %s", inspect(f, false))));
      }
    };
  }
  function invalidOp(msg, stack) {
    return function() {
      throw new IllegalOperationError(msg, stack);
    };
  }
  function invalidateSend(conn, msg, stack) {
    conn.sendMethod = conn.sendContent = conn.sendMessage = invalidOp(msg, stack);
  }
  var encodeMethod = defs.encodeMethod;
  var encodeProperties = defs.encodeProperties;
  var FRAME_OVERHEAD = defs.FRAME_OVERHEAD;
  var makeBodyFrame = frame.makeBodyFrame;
  var parseFrame = frame.parseFrame;
  var decodeFrame = frame.decodeFrame;
  function wrapStream(s) {
    if (s instanceof Duplex)
      return s;
    else {
      var ws = new Duplex;
      ws.wrap(s);
      ws._write = function(chunk, encoding, callback) {
        return s.write(chunk, encoding, callback);
      };
      return ws;
    }
  }
  function isFatalError(error) {
    switch (error && error.code) {
      case defs.constants.CONNECTION_FORCED:
      case defs.constants.REPLY_SUCCESS:
        return false;
      default:
        return true;
    }
  }
  exports.Connection = Connection;
  exports.isFatalError = isFatalError;
});

// node_modules/amqplib/lib/credentials.js
var require_credentials = __commonJS((exports, module) => {
  var codec = require_codec();
  exports.plain = function(user, passwd) {
    return {
      mechanism: "PLAIN",
      response: function() {
        return Buffer.from(["", user, passwd].join(String.fromCharCode(0)));
      },
      username: user,
      password: passwd
    };
  };
  exports.amqplain = function(user, passwd) {
    return {
      mechanism: "AMQPLAIN",
      response: function() {
        const buffer = Buffer.alloc(16384);
        const size = codec.encodeTable(buffer, { LOGIN: user, PASSWORD: passwd }, 0);
        return buffer.subarray(4, size);
      },
      username: user,
      password: passwd
    };
  };
  exports.external = function() {
    return {
      mechanism: "EXTERNAL",
      response: function() {
        return Buffer.from("");
      }
    };
  };
});

// node_modules/amqplib/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "amqplib",
    homepage: "http://amqp-node.github.io/amqplib/",
    main: "./channel_api.js",
    version: "0.10.8",
    description: "An AMQP 0-9-1 (e.g., RabbitMQ) library and client.",
    repository: {
      type: "git",
      url: "git+https://github.com/amqp-node/amqplib.git"
    },
    engines: {
      node: ">=10"
    },
    dependencies: {
      "buffer-more-ints": "~1.0.0",
      "url-parse": "~1.5.10"
    },
    devDependencies: {
      claire: "0.4.1",
      mocha: "^9.2.2",
      nyc: "^15.1.0",
      "uglify-js": "2.8.x"
    },
    scripts: {
      test: "make test"
    },
    keywords: [
      "AMQP",
      "AMQP 0-9-1",
      "RabbitMQ"
    ],
    author: "Michael Bridgen <mikeb@squaremobius.net>",
    license: "MIT"
  };
});

// node_modules/amqplib/lib/connect.js
var require_connect = __commonJS((exports, module) => {
  var URL2 = require_url_parse();
  var QS = __require("querystring");
  var Connection = require_connection().Connection;
  var fmt = __require("util").format;
  var credentials = require_credentials();
  function copyInto(obj, target) {
    var keys = Object.keys(obj);
    var i = keys.length;
    while (i--) {
      var k = keys[i];
      target[k] = obj[k];
    }
    return target;
  }
  function clone(obj) {
    return copyInto(obj, {});
  }
  var CLIENT_PROPERTIES = {
    product: "amqplib",
    version: require_package().version,
    platform: fmt("Node.JS %s", process.version),
    information: "https://amqp-node.github.io/amqplib/",
    capabilities: {
      publisher_confirms: true,
      exchange_exchange_bindings: true,
      "basic.nack": true,
      consumer_cancel_notify: true,
      "connection.blocked": true,
      authentication_failure_close: true
    }
  };
  function openFrames(vhost, query, credentials2, extraClientProperties) {
    if (!vhost)
      vhost = "/";
    else
      vhost = QS.unescape(vhost);
    var query = query || {};
    function intOrDefault(val, def) {
      return val === undefined ? def : parseInt(val);
    }
    var clientProperties = Object.create(CLIENT_PROPERTIES);
    return {
      clientProperties: copyInto(extraClientProperties, clientProperties),
      mechanism: credentials2.mechanism,
      response: credentials2.response(),
      locale: query.locale || "en_US",
      channelMax: intOrDefault(query.channelMax, 0),
      frameMax: intOrDefault(query.frameMax, 131072),
      heartbeat: intOrDefault(query.heartbeat, 0),
      virtualHost: vhost,
      capabilities: "",
      insist: 0
    };
  }
  function credentialsFromUrl(parts) {
    var user = "guest", passwd = "guest";
    if (parts.username != "" || parts.password != "") {
      user = parts.username ? unescape(parts.username) : "";
      passwd = parts.password ? unescape(parts.password) : "";
    }
    return credentials.plain(user, passwd);
  }
  function connect(url, socketOptions, openCallback) {
    var sockopts = clone(socketOptions || {});
    url = url || "amqp://localhost";
    var noDelay = !!sockopts.noDelay;
    var timeout = sockopts.timeout;
    var keepAlive = !!sockopts.keepAlive;
    var keepAliveDelay = sockopts.keepAliveDelay || 0;
    var extraClientProperties = sockopts.clientProperties || {};
    var protocol, fields;
    if (typeof url === "object") {
      protocol = (url.protocol || "amqp") + ":";
      sockopts.host = url.hostname;
      sockopts.servername = sockopts.servername || url.hostname;
      sockopts.port = url.port || (protocol === "amqp:" ? 5672 : 5671);
      var user, pass;
      if (url.username == undefined && url.password == undefined) {
        user = "guest";
        pass = "guest";
      } else {
        user = url.username || "";
        pass = url.password || "";
      }
      var config = {
        locale: url.locale,
        channelMax: url.channelMax,
        frameMax: url.frameMax,
        heartbeat: url.heartbeat
      };
      fields = openFrames(url.vhost, config, sockopts.credentials || credentials.plain(user, pass), extraClientProperties);
    } else {
      var parts = URL2(url, true);
      protocol = parts.protocol;
      sockopts.host = parts.hostname;
      sockopts.servername = sockopts.servername || parts.hostname;
      sockopts.port = parseInt(parts.port) || (protocol === "amqp:" ? 5672 : 5671);
      var vhost = parts.pathname ? parts.pathname.substr(1) : null;
      fields = openFrames(vhost, parts.query, sockopts.credentials || credentialsFromUrl(parts), extraClientProperties);
    }
    var sockok = false;
    var sock;
    function onConnect() {
      sockok = true;
      sock.setNoDelay(noDelay);
      if (keepAlive)
        sock.setKeepAlive(keepAlive, keepAliveDelay);
      var c = new Connection(sock);
      c.open(fields, function(err, ok) {
        if (timeout)
          sock.setTimeout(0);
        if (err === null) {
          openCallback(null, c);
        } else {
          sock.end();
          sock.destroy();
          openCallback(err);
        }
      });
    }
    if (protocol === "amqp:") {
      sock = __require("net").connect(sockopts, onConnect);
    } else if (protocol === "amqps:") {
      sock = __require("tls").connect(sockopts, onConnect);
    } else {
      throw new Error("Expected amqp: or amqps: as the protocol; got " + protocol);
    }
    if (timeout) {
      sock.setTimeout(timeout, function() {
        sock.end();
        sock.destroy();
        openCallback(new Error("connect ETIMEDOUT"));
      });
    }
    sock.once("error", function(err) {
      if (!sockok)
        openCallback(err);
    });
  }
  exports.connect = connect;
  exports.credentialsFromUrl = credentialsFromUrl;
});

// node_modules/amqplib/lib/channel.js
var require_channel = __commonJS((exports, module) => {
  var defs = require_defs();
  var closeMsg = require_format().closeMessage;
  var inspect = require_format().inspect;
  var methodName = require_format().methodName;
  var assert = __require("assert");
  var EventEmitter = __require("events");
  var fmt = __require("util").format;
  var IllegalOperationError = require_error().IllegalOperationError;
  var stackCapture = require_error().stackCapture;

  class Channel extends EventEmitter {
    constructor(connection) {
      super();
      this.connection = connection;
      this.reply = null;
      this.pending = [];
      this.lwm = 1;
      this.unconfirmed = [];
      this.on("ack", this.handleConfirm.bind(this, function(cb) {
        if (cb)
          cb(null);
      }));
      this.on("nack", this.handleConfirm.bind(this, function(cb) {
        if (cb)
          cb(new Error("message nacked"));
      }));
      this.on("close", function() {
        var cb;
        while (cb = this.unconfirmed.shift()) {
          if (cb)
            cb(new Error("channel closed"));
        }
      });
      this.handleMessage = acceptDeliveryOrReturn;
    }
    setOptions(options) {
      this.options = options;
    }
    allocate() {
      this.ch = this.connection.freshChannel(this, this.options);
      return this;
    }
    sendImmediately(method, fields) {
      return this.connection.sendMethod(this.ch, method, fields);
    }
    sendOrEnqueue(method, fields, reply) {
      if (!this.reply) {
        assert(this.pending.length === 0);
        this.reply = reply;
        this.sendImmediately(method, fields);
      } else {
        this.pending.push({
          method,
          fields,
          reply
        });
      }
    }
    sendMessage(fields, properties, content) {
      return this.connection.sendMessage(this.ch, defs.BasicPublish, fields, defs.BasicProperties, properties, content);
    }
    _rpc(method, fields, expect, cb) {
      var self2 = this;
      function reply(err, f) {
        if (err === null) {
          if (f.id === expect) {
            return cb(null, f);
          } else {
            var expectedName = methodName(expect);
            var e = new Error(fmt("Expected %s; got %s", expectedName, inspect(f, false)));
            self2.closeWithError(f.id, fmt("Expected %s; got %s", expectedName, methodName(f.id)), defs.constants.UNEXPECTED_FRAME, e);
            return cb(e);
          }
        } else if (err instanceof Error)
          return cb(err);
        else {
          var closeReason = (err.fields.classId << 16) + err.fields.methodId;
          var e = method === closeReason ? fmt("Operation failed: %s; %s", methodName(method), closeMsg(err)) : fmt("Channel closed by server: %s", closeMsg(err));
          var closeFrameError = new Error(e);
          closeFrameError.code = err.fields.replyCode;
          closeFrameError.classId = err.fields.classId;
          closeFrameError.methodId = err.fields.methodId;
          return cb(closeFrameError);
        }
      }
      this.sendOrEnqueue(method, fields, reply);
    }
    toClosed(capturedStack) {
      this._rejectPending();
      invalidateSend(this, "Channel closed", capturedStack);
      this.accept = invalidOp("Channel closed", capturedStack);
      this.connection.releaseChannel(this.ch);
      this.emit("close");
    }
    toClosing(capturedStack, k) {
      var send = this.sendImmediately.bind(this);
      invalidateSend(this, "Channel closing", capturedStack);
      this.accept = function(f) {
        if (f.id === defs.ChannelCloseOk) {
          if (k)
            k();
          var s = stackCapture("ChannelCloseOk frame received");
          this.toClosed(s);
        } else if (f.id === defs.ChannelClose) {
          send(defs.ChannelCloseOk, {});
        }
      };
    }
    _rejectPending() {
      function rej(r) {
        r(new Error("Channel ended, no reply will be forthcoming"));
      }
      if (this.reply !== null)
        rej(this.reply);
      this.reply = null;
      var discard;
      while (discard = this.pending.shift())
        rej(discard.reply);
      this.pending = null;
    }
    closeBecause(reason, code, k) {
      this.sendImmediately(defs.ChannelClose, {
        replyText: reason,
        replyCode: code,
        methodId: 0,
        classId: 0
      });
      var s = stackCapture("closeBecause called: " + reason);
      this.toClosing(s, k);
    }
    closeWithError(id, reason, code, error) {
      var self2 = this;
      this.closeBecause(reason, code, function() {
        error.code = code;
        if (id) {
          error.classId = defs.info(id).classId;
          error.methodId = defs.info(id).methodId;
        }
        self2.emit("error", error);
      });
    }
    acceptMessageFrame(f) {
      try {
        this.handleMessage = this.handleMessage(f);
      } catch (msg) {
        if (typeof msg === "string") {
          this.closeWithError(f.id, msg, defs.constants.UNEXPECTED_FRAME, new Error(msg));
        } else if (msg instanceof Error) {
          this.closeWithError(f.id, "Error while processing message", defs.constants.INTERNAL_ERROR, msg);
        } else {
          this.closeWithError(f.id, "Internal error while processing message", defs.constants.INTERNAL_ERROR, new Error(msg.toString()));
        }
      }
    }
    handleConfirm(handle, f) {
      var tag = f.deliveryTag;
      var multi = f.multiple;
      if (multi) {
        var confirmed = this.unconfirmed.splice(0, tag - this.lwm + 1);
        this.lwm = tag + 1;
        confirmed.forEach(handle);
      } else {
        var c;
        if (tag === this.lwm) {
          c = this.unconfirmed.shift();
          this.lwm++;
          while (this.unconfirmed[0] === null) {
            this.unconfirmed.shift();
            this.lwm++;
          }
        } else {
          c = this.unconfirmed[tag - this.lwm];
          this.unconfirmed[tag - this.lwm] = null;
        }
        handle(c);
      }
    }
    pushConfirmCallback(cb) {
      this.unconfirmed.push(cb || false);
    }
    onBufferDrain() {
      this.emit("drain");
    }
    accept(f) {
      switch (f.id) {
        case undefined:
        case defs.BasicDeliver:
        case defs.BasicReturn:
        case defs.BasicProperties:
          return this.acceptMessageFrame(f);
        case defs.BasicAck:
          return this.emit("ack", f.fields);
        case defs.BasicNack:
          return this.emit("nack", f.fields);
        case defs.BasicCancel:
          return this.emit("cancel", f.fields);
        case defs.ChannelClose:
          if (this.reply) {
            var reply = this.reply;
            this.reply = null;
            reply(f);
          }
          var emsg = "Channel closed by server: " + closeMsg(f);
          this.sendImmediately(defs.ChannelCloseOk, {});
          var error = new Error(emsg);
          error.code = f.fields.replyCode;
          error.classId = f.fields.classId;
          error.methodId = f.fields.methodId;
          this.emit("error", error);
          var s = stackCapture(emsg);
          this.toClosed(s);
          return;
        case defs.BasicFlow:
          return this.closeWithError(f.id, "Flow not implemented", defs.constants.NOT_IMPLEMENTED, new Error("Flow not implemented"));
        default:
          var reply = this.reply;
          this.reply = null;
          if (this.pending.length > 0) {
            var send = this.pending.shift();
            this.reply = send.reply;
            this.sendImmediately(send.method, send.fields);
          }
          return reply(null, f);
      }
    }
  }
  function invalidOp(msg, stack) {
    return function() {
      throw new IllegalOperationError(msg, stack);
    };
  }
  function invalidateSend(ch, msg, stack) {
    ch.sendImmediately = ch.sendOrEnqueue = ch.sendMessage = invalidOp(msg, stack);
  }
  function acceptDeliveryOrReturn(f) {
    var event;
    if (f.id === defs.BasicDeliver)
      event = "delivery";
    else if (f.id === defs.BasicReturn)
      event = "return";
    else
      throw fmt("Expected BasicDeliver or BasicReturn; got %s", inspect(f));
    var self2 = this;
    var fields = f.fields;
    return acceptMessage(function(message) {
      message.fields = fields;
      self2.emit(event, message);
    });
  }
  function acceptMessage(continuation) {
    var totalSize = 0, remaining = 0;
    var buffers = null;
    var message = {
      fields: null,
      properties: null,
      content: null
    };
    return headers;
    function headers(f) {
      if (f.id === defs.BasicProperties) {
        message.properties = f.fields;
        totalSize = remaining = f.size;
        if (totalSize === 0) {
          message.content = Buffer.alloc(0);
          continuation(message);
          return acceptDeliveryOrReturn;
        } else {
          return content;
        }
      } else {
        throw "Expected headers frame after delivery";
      }
    }
    function content(f) {
      if (f.content) {
        var size = f.content.length;
        remaining -= size;
        if (remaining === 0) {
          if (buffers !== null) {
            buffers.push(f.content);
            message.content = Buffer.concat(buffers);
          } else {
            message.content = f.content;
          }
          continuation(message);
          return acceptDeliveryOrReturn;
        } else if (remaining < 0) {
          throw fmt("Too much content sent! Expected %d bytes", totalSize);
        } else {
          if (buffers !== null)
            buffers.push(f.content);
          else
            buffers = [f.content];
          return content;
        }
      } else
        throw "Expected content frame after headers";
    }
  }

  class BaseChannel extends Channel {
    constructor(connection) {
      super(connection);
      this.consumers = new Map;
    }
    registerConsumer(tag, callback) {
      this.consumers.set(tag, callback);
    }
    unregisterConsumer(tag) {
      this.consumers.delete(tag);
    }
    dispatchMessage(fields, message) {
      var consumerTag = fields.consumerTag;
      var consumer = this.consumers.get(consumerTag);
      if (consumer) {
        return consumer(message);
      } else {
        throw new Error("Unknown consumer: " + consumerTag);
      }
    }
    handleDelivery(message) {
      return this.dispatchMessage(message.fields, message);
    }
    handleCancel(fields) {
      var result = this.dispatchMessage(fields, null);
      this.unregisterConsumer(fields.consumerTag);
      return result;
    }
  }
  exports.acceptMessage = acceptMessage;
  exports.BaseChannel = BaseChannel;
  exports.Channel = Channel;
});

// node_modules/amqplib/lib/api_args.js
var require_api_args = __commonJS((exports, module) => {
  function setIfDefined(obj, prop, value) {
    if (value != null)
      obj[prop] = value;
  }
  var EMPTY_OPTIONS = Object.freeze({});
  var Args = {};
  Args.assertQueue = function(queue, options) {
    queue = queue || "";
    options = options || EMPTY_OPTIONS;
    var argt = Object.create(options.arguments || null);
    setIfDefined(argt, "x-expires", options.expires);
    setIfDefined(argt, "x-message-ttl", options.messageTtl);
    setIfDefined(argt, "x-dead-letter-exchange", options.deadLetterExchange);
    setIfDefined(argt, "x-dead-letter-routing-key", options.deadLetterRoutingKey);
    setIfDefined(argt, "x-max-length", options.maxLength);
    setIfDefined(argt, "x-max-priority", options.maxPriority);
    setIfDefined(argt, "x-overflow", options.overflow);
    setIfDefined(argt, "x-queue-mode", options.queueMode);
    return {
      queue,
      exclusive: !!options.exclusive,
      durable: options.durable === undefined ? true : options.durable,
      autoDelete: !!options.autoDelete,
      arguments: argt,
      passive: false,
      ticket: 0,
      nowait: false
    };
  };
  Args.checkQueue = function(queue) {
    return {
      queue,
      passive: true,
      nowait: false,
      durable: true,
      autoDelete: false,
      exclusive: false,
      ticket: 0
    };
  };
  Args.deleteQueue = function(queue, options) {
    options = options || EMPTY_OPTIONS;
    return {
      queue,
      ifUnused: !!options.ifUnused,
      ifEmpty: !!options.ifEmpty,
      ticket: 0,
      nowait: false
    };
  };
  Args.purgeQueue = function(queue) {
    return {
      queue,
      ticket: 0,
      nowait: false
    };
  };
  Args.bindQueue = function(queue, source, pattern, argt) {
    return {
      queue,
      exchange: source,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.unbindQueue = function(queue, source, pattern, argt) {
    return {
      queue,
      exchange: source,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.assertExchange = function(exchange, type, options) {
    options = options || EMPTY_OPTIONS;
    var argt = Object.create(options.arguments || null);
    setIfDefined(argt, "alternate-exchange", options.alternateExchange);
    return {
      exchange,
      ticket: 0,
      type,
      passive: false,
      durable: options.durable === undefined ? true : options.durable,
      autoDelete: !!options.autoDelete,
      internal: !!options.internal,
      nowait: false,
      arguments: argt
    };
  };
  Args.checkExchange = function(exchange) {
    return {
      exchange,
      passive: true,
      nowait: false,
      durable: true,
      internal: false,
      type: "",
      autoDelete: false,
      ticket: 0
    };
  };
  Args.deleteExchange = function(exchange, options) {
    options = options || EMPTY_OPTIONS;
    return {
      exchange,
      ifUnused: !!options.ifUnused,
      ticket: 0,
      nowait: false
    };
  };
  Args.bindExchange = function(dest, source, pattern, argt) {
    return {
      source,
      destination: dest,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.unbindExchange = function(dest, source, pattern, argt) {
    return {
      source,
      destination: dest,
      routingKey: pattern,
      arguments: argt,
      ticket: 0,
      nowait: false
    };
  };
  Args.publish = function(exchange, routingKey, options) {
    options = options || EMPTY_OPTIONS;
    function convertCC(cc) {
      if (cc === undefined) {
        return;
      } else if (Array.isArray(cc)) {
        return cc.map(String);
      } else
        return [String(cc)];
    }
    var headers = Object.create(options.headers || null);
    setIfDefined(headers, "CC", convertCC(options.CC));
    setIfDefined(headers, "BCC", convertCC(options.BCC));
    var deliveryMode;
    if (options.persistent !== undefined)
      deliveryMode = options.persistent ? 2 : 1;
    else if (typeof options.deliveryMode === "number")
      deliveryMode = options.deliveryMode;
    else if (options.deliveryMode)
      deliveryMode = 2;
    var expiration = options.expiration;
    if (expiration !== undefined)
      expiration = expiration.toString();
    return {
      exchange,
      routingKey,
      mandatory: !!options.mandatory,
      immediate: false,
      ticket: undefined,
      contentType: options.contentType,
      contentEncoding: options.contentEncoding,
      headers,
      deliveryMode,
      priority: options.priority,
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      expiration,
      messageId: options.messageId,
      timestamp: options.timestamp,
      type: options.type,
      userId: options.userId,
      appId: options.appId,
      clusterId: undefined
    };
  };
  Args.consume = function(queue, options) {
    options = options || EMPTY_OPTIONS;
    var argt = Object.create(options.arguments || null);
    setIfDefined(argt, "x-priority", options.priority);
    return {
      ticket: 0,
      queue,
      consumerTag: options.consumerTag || "",
      noLocal: !!options.noLocal,
      noAck: !!options.noAck,
      exclusive: !!options.exclusive,
      nowait: false,
      arguments: argt
    };
  };
  Args.cancel = function(consumerTag) {
    return {
      consumerTag,
      nowait: false
    };
  };
  Args.get = function(queue, options) {
    options = options || EMPTY_OPTIONS;
    return {
      ticket: 0,
      queue,
      noAck: !!options.noAck
    };
  };
  Args.ack = function(tag, allUpTo) {
    return {
      deliveryTag: tag,
      multiple: !!allUpTo
    };
  };
  Args.nack = function(tag, allUpTo, requeue) {
    return {
      deliveryTag: tag,
      multiple: !!allUpTo,
      requeue: requeue === undefined ? true : requeue
    };
  };
  Args.reject = function(tag, requeue) {
    return {
      deliveryTag: tag,
      requeue: requeue === undefined ? true : requeue
    };
  };
  Args.prefetch = function(count, global2) {
    return {
      prefetchCount: count || 0,
      prefetchSize: 0,
      global: !!global2
    };
  };
  Args.recover = function() {
    return { requeue: true };
  };
  module.exports = Object.freeze(Args);
});

// node_modules/amqplib/lib/channel_model.js
var require_channel_model = __commonJS((exports, module) => {
  var EventEmitter = __require("events");
  var promisify = __require("util").promisify;
  var defs = require_defs();
  var { BaseChannel } = require_channel();
  var { acceptMessage } = require_channel();
  var Args = require_api_args();
  var { inspect } = require_format();

  class ChannelModel extends EventEmitter {
    constructor(connection) {
      super();
      this.connection = connection;
      ["error", "close", "blocked", "unblocked"].forEach((ev) => {
        connection.on(ev, this.emit.bind(this, ev));
      });
    }
    close() {
      return promisify(this.connection.close.bind(this.connection))();
    }
    updateSecret(newSecret, reason) {
      return promisify(this.connection._updateSecret.bind(this.connection))(newSecret, reason);
    }
    async createChannel(options) {
      const channel = new Channel(this.connection);
      channel.setOptions(options);
      await channel.open();
      return channel;
    }
    async createConfirmChannel(options) {
      const channel = new ConfirmChannel(this.connection);
      channel.setOptions(options);
      await channel.open();
      await channel.rpc(defs.ConfirmSelect, { nowait: false }, defs.ConfirmSelectOk);
      return channel;
    }
  }

  class Channel extends BaseChannel {
    constructor(connection) {
      super(connection);
      this.on("delivery", this.handleDelivery.bind(this));
      this.on("cancel", this.handleCancel.bind(this));
    }
    async rpc(method, fields, expect) {
      const f = await promisify((cb) => {
        return this._rpc(method, fields, expect, cb);
      })();
      return f.fields;
    }
    async open() {
      const ch = await this.allocate.bind(this)();
      return ch.rpc(defs.ChannelOpen, { outOfBand: "" }, defs.ChannelOpenOk);
    }
    close() {
      return promisify((cb) => {
        return this.closeBecause("Goodbye", defs.constants.REPLY_SUCCESS, cb);
      })();
    }
    assertQueue(queue, options) {
      return this.rpc(defs.QueueDeclare, Args.assertQueue(queue, options), defs.QueueDeclareOk);
    }
    checkQueue(queue) {
      return this.rpc(defs.QueueDeclare, Args.checkQueue(queue), defs.QueueDeclareOk);
    }
    deleteQueue(queue, options) {
      return this.rpc(defs.QueueDelete, Args.deleteQueue(queue, options), defs.QueueDeleteOk);
    }
    purgeQueue(queue) {
      return this.rpc(defs.QueuePurge, Args.purgeQueue(queue), defs.QueuePurgeOk);
    }
    bindQueue(queue, source, pattern, argt) {
      return this.rpc(defs.QueueBind, Args.bindQueue(queue, source, pattern, argt), defs.QueueBindOk);
    }
    unbindQueue(queue, source, pattern, argt) {
      return this.rpc(defs.QueueUnbind, Args.unbindQueue(queue, source, pattern, argt), defs.QueueUnbindOk);
    }
    assertExchange(exchange, type, options) {
      return this.rpc(defs.ExchangeDeclare, Args.assertExchange(exchange, type, options), defs.ExchangeDeclareOk).then((_ok) => {
        return { exchange };
      });
    }
    checkExchange(exchange) {
      return this.rpc(defs.ExchangeDeclare, Args.checkExchange(exchange), defs.ExchangeDeclareOk);
    }
    deleteExchange(name, options) {
      return this.rpc(defs.ExchangeDelete, Args.deleteExchange(name, options), defs.ExchangeDeleteOk);
    }
    bindExchange(dest, source, pattern, argt) {
      return this.rpc(defs.ExchangeBind, Args.bindExchange(dest, source, pattern, argt), defs.ExchangeBindOk);
    }
    unbindExchange(dest, source, pattern, argt) {
      return this.rpc(defs.ExchangeUnbind, Args.unbindExchange(dest, source, pattern, argt), defs.ExchangeUnbindOk);
    }
    publish(exchange, routingKey, content, options) {
      const fieldsAndProps = Args.publish(exchange, routingKey, options);
      return this.sendMessage(fieldsAndProps, fieldsAndProps, content);
    }
    sendToQueue(queue, content, options) {
      return this.publish("", queue, content, options);
    }
    consume(queue, callback, options) {
      const fields = Args.consume(queue, options);
      return new Promise((resolve, reject) => {
        this._rpc(defs.BasicConsume, fields, defs.BasicConsumeOk, (err, ok) => {
          if (err)
            return reject(err);
          this.registerConsumer(ok.fields.consumerTag, callback);
          resolve(ok.fields);
        });
      });
    }
    async cancel(consumerTag) {
      const ok = await promisify((cb) => {
        this._rpc(defs.BasicCancel, Args.cancel(consumerTag), defs.BasicCancelOk, cb);
      })().then((ok2) => {
        this.unregisterConsumer(consumerTag);
        return ok2.fields;
      });
    }
    get(queue, options) {
      const fields = Args.get(queue, options);
      return new Promise((resolve, reject) => {
        this.sendOrEnqueue(defs.BasicGet, fields, (err, f) => {
          if (err)
            return reject(err);
          if (f.id === defs.BasicGetEmpty) {
            return resolve(false);
          } else if (f.id === defs.BasicGetOk) {
            const fields2 = f.fields;
            this.handleMessage = acceptMessage((m) => {
              m.fields = fields2;
              resolve(m);
            });
          } else {
            reject(new Error(`Unexpected response to BasicGet: ${inspect(f)}`));
          }
        });
      });
    }
    ack(message, allUpTo) {
      this.sendImmediately(defs.BasicAck, Args.ack(message.fields.deliveryTag, allUpTo));
    }
    ackAll() {
      this.sendImmediately(defs.BasicAck, Args.ack(0, true));
    }
    nack(message, allUpTo, requeue) {
      this.sendImmediately(defs.BasicNack, Args.nack(message.fields.deliveryTag, allUpTo, requeue));
    }
    nackAll(requeue) {
      this.sendImmediately(defs.BasicNack, Args.nack(0, true, requeue));
    }
    reject(message, requeue) {
      this.sendImmediately(defs.BasicReject, Args.reject(message.fields.deliveryTag, requeue));
    }
    recover() {
      return this.rpc(defs.BasicRecover, Args.recover(), defs.BasicRecoverOk);
    }
    qos(count, global2) {
      return this.rpc(defs.BasicQos, Args.prefetch(count, global2), defs.BasicQosOk);
    }
  }
  Channel.prototype.prefetch = Channel.prototype.qos;

  class ConfirmChannel extends Channel {
    publish(exchange, routingKey, content, options, cb) {
      this.pushConfirmCallback(cb);
      return super.publish(exchange, routingKey, content, options);
    }
    sendToQueue(queue, content, options, cb) {
      return this.publish("", queue, content, options, cb);
    }
    waitForConfirms() {
      const awaiting = [];
      const unconfirmed = this.unconfirmed;
      unconfirmed.forEach((val, index) => {
        if (val !== null) {
          const confirmed = new Promise((resolve, reject) => {
            unconfirmed[index] = (err) => {
              if (val)
                val(err);
              if (err === null)
                resolve();
              else
                reject(err);
            };
          });
          awaiting.push(confirmed);
        }
      });
      if (!this.pending) {
        var cb;
        while (cb = this.unconfirmed.shift()) {
          if (cb)
            cb(new Error("channel closed"));
        }
      }
      return Promise.all(awaiting);
    }
  }
  exports.ConfirmChannel = ConfirmChannel;
  exports.Channel = Channel;
  exports.ChannelModel = ChannelModel;
});

// node_modules/amqplib/channel_api.js
var require_channel_api = __commonJS((exports, module) => {
  var raw_connect = require_connect().connect;
  var ChannelModel = require_channel_model().ChannelModel;
  var promisify = __require("util").promisify;
  function connect(url, connOptions) {
    return promisify(function(cb) {
      return raw_connect(url, connOptions, cb);
    })().then(function(conn) {
      return new ChannelModel(conn);
    });
  }
  exports.connect = connect;
  exports.credentials = require_credentials();
  exports.IllegalOperationError = require_error().IllegalOperationError;
});

// node_modules/delayed-stream/lib/delayed_stream.js
var require_delayed_stream = __commonJS((exports, module) => {
  var Stream = __require("stream").Stream;
  var util = __require("util");
  module.exports = DelayedStream;
  function DelayedStream() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
  }
  util.inherits(DelayedStream, Stream);
  DelayedStream.create = function(source, options) {
    var delayedStream = new this;
    options = options || {};
    for (var option in options) {
      delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
      delayedStream._handleEmit(arguments);
      return realEmit.apply(source, arguments);
    };
    source.on("error", function() {});
    if (delayedStream.pauseStream) {
      source.pause();
    }
    return delayedStream;
  };
  Object.defineProperty(DelayedStream.prototype, "readable", {
    configurable: true,
    enumerable: true,
    get: function() {
      return this.source.readable;
    }
  });
  DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
  };
  DelayedStream.prototype.resume = function() {
    if (!this._released) {
      this.release();
    }
    this.source.resume();
  };
  DelayedStream.prototype.pause = function() {
    this.source.pause();
  };
  DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach(function(args) {
      this.emit.apply(this, args);
    }.bind(this));
    this._bufferedEvents = [];
  };
  DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
  };
  DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
      this.emit.apply(this, args);
      return;
    }
    if (args[0] === "data") {
      this.dataSize += args[1].length;
      this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
  };
  DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
      return;
    }
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    this._maxDataSizeExceeded = true;
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this.emit("error", new Error(message));
  };
});

// node_modules/combined-stream/lib/combined_stream.js
var require_combined_stream = __commonJS((exports, module) => {
  var util = __require("util");
  var Stream = __require("stream").Stream;
  var DelayedStream = require_delayed_stream();
  module.exports = CombinedStream;
  function CombinedStream() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
  }
  util.inherits(CombinedStream, Stream);
  CombinedStream.create = function(options) {
    var combinedStream = new this;
    options = options || {};
    for (var option in options) {
      combinedStream[option] = options[option];
    }
    return combinedStream;
  };
  CombinedStream.isStreamLike = function(stream) {
    return typeof stream !== "function" && typeof stream !== "string" && typeof stream !== "boolean" && typeof stream !== "number" && !Buffer.isBuffer(stream);
  };
  CombinedStream.prototype.append = function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      if (!(stream instanceof DelayedStream)) {
        var newStream = DelayedStream.create(stream, {
          maxDataSize: Infinity,
          pauseStream: this.pauseStreams
        });
        stream.on("data", this._checkDataSize.bind(this));
        stream = newStream;
      }
      this._handleErrors(stream);
      if (this.pauseStreams) {
        stream.pause();
      }
    }
    this._streams.push(stream);
    return this;
  };
  CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
  };
  CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
      this._pendingNext = true;
      return;
    }
    this._insideLoop = true;
    try {
      do {
        this._pendingNext = false;
        this._realGetNext();
      } while (this._pendingNext);
    } finally {
      this._insideLoop = false;
    }
  };
  CombinedStream.prototype._realGetNext = function() {
    var stream = this._streams.shift();
    if (typeof stream == "undefined") {
      this.end();
      return;
    }
    if (typeof stream !== "function") {
      this._pipeNext(stream);
      return;
    }
    var getStream = stream;
    getStream(function(stream2) {
      var isStreamLike = CombinedStream.isStreamLike(stream2);
      if (isStreamLike) {
        stream2.on("data", this._checkDataSize.bind(this));
        this._handleErrors(stream2);
      }
      this._pipeNext(stream2);
    }.bind(this));
  };
  CombinedStream.prototype._pipeNext = function(stream) {
    this._currentStream = stream;
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      stream.on("end", this._getNext.bind(this));
      stream.pipe(this, { end: false });
      return;
    }
    var value = stream;
    this.write(value);
    this._getNext();
  };
  CombinedStream.prototype._handleErrors = function(stream) {
    var self2 = this;
    stream.on("error", function(err) {
      self2._emitError(err);
    });
  };
  CombinedStream.prototype.write = function(data) {
    this.emit("data", data);
  };
  CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
      return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function")
      this._currentStream.pause();
    this.emit("pause");
  };
  CombinedStream.prototype.resume = function() {
    if (!this._released) {
      this._released = true;
      this.writable = true;
      this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function")
      this._currentStream.resume();
    this.emit("resume");
  };
  CombinedStream.prototype.end = function() {
    this._reset();
    this.emit("end");
  };
  CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit("close");
  };
  CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
  };
  CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
      return;
    }
    var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this._emitError(new Error(message));
  };
  CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self2 = this;
    this._streams.forEach(function(stream) {
      if (!stream.dataSize) {
        return;
      }
      self2.dataSize += stream.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
      this.dataSize += this._currentStream.dataSize;
    }
  };
  CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit("error", err);
  };
});

// node_modules/mime-db/db.json
var require_db = __commonJS((exports, module) => {
  module.exports = {
    "application/1d-interleaved-parityfec": {
      source: "iana"
    },
    "application/3gpdash-qoe-report+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/3gpp-ims+xml": {
      source: "iana",
      compressible: true
    },
    "application/3gpphal+json": {
      source: "iana",
      compressible: true
    },
    "application/3gpphalforms+json": {
      source: "iana",
      compressible: true
    },
    "application/a2l": {
      source: "iana"
    },
    "application/ace+cbor": {
      source: "iana"
    },
    "application/activemessage": {
      source: "iana"
    },
    "application/activity+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-costmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-directory+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcost+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointcostparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointprop+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-endpointpropparams+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-error+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmap+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-networkmapfilter+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamcontrol+json": {
      source: "iana",
      compressible: true
    },
    "application/alto-updatestreamparams+json": {
      source: "iana",
      compressible: true
    },
    "application/aml": {
      source: "iana"
    },
    "application/andrew-inset": {
      source: "iana",
      extensions: ["ez"]
    },
    "application/applefile": {
      source: "iana"
    },
    "application/applixware": {
      source: "apache",
      extensions: ["aw"]
    },
    "application/at+jwt": {
      source: "iana"
    },
    "application/atf": {
      source: "iana"
    },
    "application/atfx": {
      source: "iana"
    },
    "application/atom+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atom"]
    },
    "application/atomcat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomcat"]
    },
    "application/atomdeleted+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomdeleted"]
    },
    "application/atomicmail": {
      source: "iana"
    },
    "application/atomsvc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["atomsvc"]
    },
    "application/atsc-dwd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dwd"]
    },
    "application/atsc-dynamic-event-message": {
      source: "iana"
    },
    "application/atsc-held+xml": {
      source: "iana",
      compressible: true,
      extensions: ["held"]
    },
    "application/atsc-rdt+json": {
      source: "iana",
      compressible: true
    },
    "application/atsc-rsat+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsat"]
    },
    "application/atxml": {
      source: "iana"
    },
    "application/auth-policy+xml": {
      source: "iana",
      compressible: true
    },
    "application/bacnet-xdd+zip": {
      source: "iana",
      compressible: false
    },
    "application/batch-smtp": {
      source: "iana"
    },
    "application/bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/beep+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/calendar+json": {
      source: "iana",
      compressible: true
    },
    "application/calendar+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xcs"]
    },
    "application/call-completion": {
      source: "iana"
    },
    "application/cals-1840": {
      source: "iana"
    },
    "application/captive+json": {
      source: "iana",
      compressible: true
    },
    "application/cbor": {
      source: "iana"
    },
    "application/cbor-seq": {
      source: "iana"
    },
    "application/cccex": {
      source: "iana"
    },
    "application/ccmp+xml": {
      source: "iana",
      compressible: true
    },
    "application/ccxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ccxml"]
    },
    "application/cdfx+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdfx"]
    },
    "application/cdmi-capability": {
      source: "iana",
      extensions: ["cdmia"]
    },
    "application/cdmi-container": {
      source: "iana",
      extensions: ["cdmic"]
    },
    "application/cdmi-domain": {
      source: "iana",
      extensions: ["cdmid"]
    },
    "application/cdmi-object": {
      source: "iana",
      extensions: ["cdmio"]
    },
    "application/cdmi-queue": {
      source: "iana",
      extensions: ["cdmiq"]
    },
    "application/cdni": {
      source: "iana"
    },
    "application/cea": {
      source: "iana"
    },
    "application/cea-2018+xml": {
      source: "iana",
      compressible: true
    },
    "application/cellml+xml": {
      source: "iana",
      compressible: true
    },
    "application/cfw": {
      source: "iana"
    },
    "application/city+json": {
      source: "iana",
      compressible: true
    },
    "application/clr": {
      source: "iana"
    },
    "application/clue+xml": {
      source: "iana",
      compressible: true
    },
    "application/clue_info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cms": {
      source: "iana"
    },
    "application/cnrp+xml": {
      source: "iana",
      compressible: true
    },
    "application/coap-group+json": {
      source: "iana",
      compressible: true
    },
    "application/coap-payload": {
      source: "iana"
    },
    "application/commonground": {
      source: "iana"
    },
    "application/conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/cose": {
      source: "iana"
    },
    "application/cose-key": {
      source: "iana"
    },
    "application/cose-key-set": {
      source: "iana"
    },
    "application/cpl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cpl"]
    },
    "application/csrattrs": {
      source: "iana"
    },
    "application/csta+xml": {
      source: "iana",
      compressible: true
    },
    "application/cstadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/csvm+json": {
      source: "iana",
      compressible: true
    },
    "application/cu-seeme": {
      source: "apache",
      extensions: ["cu"]
    },
    "application/cwt": {
      source: "iana"
    },
    "application/cybercash": {
      source: "iana"
    },
    "application/dart": {
      compressible: true
    },
    "application/dash+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpd"]
    },
    "application/dash-patch+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpp"]
    },
    "application/dashdelta": {
      source: "iana"
    },
    "application/davmount+xml": {
      source: "iana",
      compressible: true,
      extensions: ["davmount"]
    },
    "application/dca-rft": {
      source: "iana"
    },
    "application/dcd": {
      source: "iana"
    },
    "application/dec-dx": {
      source: "iana"
    },
    "application/dialog-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/dicom": {
      source: "iana"
    },
    "application/dicom+json": {
      source: "iana",
      compressible: true
    },
    "application/dicom+xml": {
      source: "iana",
      compressible: true
    },
    "application/dii": {
      source: "iana"
    },
    "application/dit": {
      source: "iana"
    },
    "application/dns": {
      source: "iana"
    },
    "application/dns+json": {
      source: "iana",
      compressible: true
    },
    "application/dns-message": {
      source: "iana"
    },
    "application/docbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dbk"]
    },
    "application/dots+cbor": {
      source: "iana"
    },
    "application/dskpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/dssc+der": {
      source: "iana",
      extensions: ["dssc"]
    },
    "application/dssc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdssc"]
    },
    "application/dvcs": {
      source: "iana"
    },
    "application/ecmascript": {
      source: "iana",
      compressible: true,
      extensions: ["es", "ecma"]
    },
    "application/edi-consent": {
      source: "iana"
    },
    "application/edi-x12": {
      source: "iana",
      compressible: false
    },
    "application/edifact": {
      source: "iana",
      compressible: false
    },
    "application/efi": {
      source: "iana"
    },
    "application/elm+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/elm+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.cap+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/emergencycalldata.comment+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.control+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.deviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.ecall.msd": {
      source: "iana"
    },
    "application/emergencycalldata.providerinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.serviceinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.subscriberinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/emergencycalldata.veds+xml": {
      source: "iana",
      compressible: true
    },
    "application/emma+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emma"]
    },
    "application/emotionml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["emotionml"]
    },
    "application/encaprtp": {
      source: "iana"
    },
    "application/epp+xml": {
      source: "iana",
      compressible: true
    },
    "application/epub+zip": {
      source: "iana",
      compressible: false,
      extensions: ["epub"]
    },
    "application/eshop": {
      source: "iana"
    },
    "application/exi": {
      source: "iana",
      extensions: ["exi"]
    },
    "application/expect-ct-report+json": {
      source: "iana",
      compressible: true
    },
    "application/express": {
      source: "iana",
      extensions: ["exp"]
    },
    "application/fastinfoset": {
      source: "iana"
    },
    "application/fastsoap": {
      source: "iana"
    },
    "application/fdt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fdt"]
    },
    "application/fhir+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fhir+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/fido.trusted-apps+json": {
      compressible: true
    },
    "application/fits": {
      source: "iana"
    },
    "application/flexfec": {
      source: "iana"
    },
    "application/font-sfnt": {
      source: "iana"
    },
    "application/font-tdpfr": {
      source: "iana",
      extensions: ["pfr"]
    },
    "application/font-woff": {
      source: "iana",
      compressible: false
    },
    "application/framework-attributes+xml": {
      source: "iana",
      compressible: true
    },
    "application/geo+json": {
      source: "iana",
      compressible: true,
      extensions: ["geojson"]
    },
    "application/geo+json-seq": {
      source: "iana"
    },
    "application/geopackage+sqlite3": {
      source: "iana"
    },
    "application/geoxacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/gltf-buffer": {
      source: "iana"
    },
    "application/gml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["gml"]
    },
    "application/gpx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["gpx"]
    },
    "application/gxf": {
      source: "apache",
      extensions: ["gxf"]
    },
    "application/gzip": {
      source: "iana",
      compressible: false,
      extensions: ["gz"]
    },
    "application/h224": {
      source: "iana"
    },
    "application/held+xml": {
      source: "iana",
      compressible: true
    },
    "application/hjson": {
      extensions: ["hjson"]
    },
    "application/http": {
      source: "iana"
    },
    "application/hyperstudio": {
      source: "iana",
      extensions: ["stk"]
    },
    "application/ibe-key-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pkg-reply+xml": {
      source: "iana",
      compressible: true
    },
    "application/ibe-pp-data": {
      source: "iana"
    },
    "application/iges": {
      source: "iana"
    },
    "application/im-iscomposing+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/index": {
      source: "iana"
    },
    "application/index.cmd": {
      source: "iana"
    },
    "application/index.obj": {
      source: "iana"
    },
    "application/index.response": {
      source: "iana"
    },
    "application/index.vnd": {
      source: "iana"
    },
    "application/inkml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ink", "inkml"]
    },
    "application/iotp": {
      source: "iana"
    },
    "application/ipfix": {
      source: "iana",
      extensions: ["ipfix"]
    },
    "application/ipp": {
      source: "iana"
    },
    "application/isup": {
      source: "iana"
    },
    "application/its+xml": {
      source: "iana",
      compressible: true,
      extensions: ["its"]
    },
    "application/java-archive": {
      source: "apache",
      compressible: false,
      extensions: ["jar", "war", "ear"]
    },
    "application/java-serialized-object": {
      source: "apache",
      compressible: false,
      extensions: ["ser"]
    },
    "application/java-vm": {
      source: "apache",
      compressible: false,
      extensions: ["class"]
    },
    "application/javascript": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["js", "mjs"]
    },
    "application/jf2feed+json": {
      source: "iana",
      compressible: true
    },
    "application/jose": {
      source: "iana"
    },
    "application/jose+json": {
      source: "iana",
      compressible: true
    },
    "application/jrd+json": {
      source: "iana",
      compressible: true
    },
    "application/jscalendar+json": {
      source: "iana",
      compressible: true
    },
    "application/json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["json", "map"]
    },
    "application/json-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/json-seq": {
      source: "iana"
    },
    "application/json5": {
      extensions: ["json5"]
    },
    "application/jsonml+json": {
      source: "apache",
      compressible: true,
      extensions: ["jsonml"]
    },
    "application/jwk+json": {
      source: "iana",
      compressible: true
    },
    "application/jwk-set+json": {
      source: "iana",
      compressible: true
    },
    "application/jwt": {
      source: "iana"
    },
    "application/kpml-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/kpml-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/ld+json": {
      source: "iana",
      compressible: true,
      extensions: ["jsonld"]
    },
    "application/lgr+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lgr"]
    },
    "application/link-format": {
      source: "iana"
    },
    "application/load-control+xml": {
      source: "iana",
      compressible: true
    },
    "application/lost+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lostxml"]
    },
    "application/lostsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/lpf+zip": {
      source: "iana",
      compressible: false
    },
    "application/lxf": {
      source: "iana"
    },
    "application/mac-binhex40": {
      source: "iana",
      extensions: ["hqx"]
    },
    "application/mac-compactpro": {
      source: "apache",
      extensions: ["cpt"]
    },
    "application/macwriteii": {
      source: "iana"
    },
    "application/mads+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mads"]
    },
    "application/manifest+json": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["webmanifest"]
    },
    "application/marc": {
      source: "iana",
      extensions: ["mrc"]
    },
    "application/marcxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mrcx"]
    },
    "application/mathematica": {
      source: "iana",
      extensions: ["ma", "nb", "mb"]
    },
    "application/mathml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mathml"]
    },
    "application/mathml-content+xml": {
      source: "iana",
      compressible: true
    },
    "application/mathml-presentation+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-associated-procedure-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-deregister+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-envelope+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-msk-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-protection-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-reception-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-register-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-schedule+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbms-user-service-description+xml": {
      source: "iana",
      compressible: true
    },
    "application/mbox": {
      source: "iana",
      extensions: ["mbox"]
    },
    "application/media-policy-dataset+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpf"]
    },
    "application/media_control+xml": {
      source: "iana",
      compressible: true
    },
    "application/mediaservercontrol+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mscml"]
    },
    "application/merge-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/metalink+xml": {
      source: "apache",
      compressible: true,
      extensions: ["metalink"]
    },
    "application/metalink4+xml": {
      source: "iana",
      compressible: true,
      extensions: ["meta4"]
    },
    "application/mets+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mets"]
    },
    "application/mf4": {
      source: "iana"
    },
    "application/mikey": {
      source: "iana"
    },
    "application/mipc": {
      source: "iana"
    },
    "application/missing-blocks+cbor-seq": {
      source: "iana"
    },
    "application/mmt-aei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["maei"]
    },
    "application/mmt-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musd"]
    },
    "application/mods+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mods"]
    },
    "application/moss-keys": {
      source: "iana"
    },
    "application/moss-signature": {
      source: "iana"
    },
    "application/mosskey-data": {
      source: "iana"
    },
    "application/mosskey-request": {
      source: "iana"
    },
    "application/mp21": {
      source: "iana",
      extensions: ["m21", "mp21"]
    },
    "application/mp4": {
      source: "iana",
      extensions: ["mp4s", "m4p"]
    },
    "application/mpeg4-generic": {
      source: "iana"
    },
    "application/mpeg4-iod": {
      source: "iana"
    },
    "application/mpeg4-iod-xmt": {
      source: "iana"
    },
    "application/mrb-consumer+xml": {
      source: "iana",
      compressible: true
    },
    "application/mrb-publish+xml": {
      source: "iana",
      compressible: true
    },
    "application/msc-ivr+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msc-mixer+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/msword": {
      source: "iana",
      compressible: false,
      extensions: ["doc", "dot"]
    },
    "application/mud+json": {
      source: "iana",
      compressible: true
    },
    "application/multipart-core": {
      source: "iana"
    },
    "application/mxf": {
      source: "iana",
      extensions: ["mxf"]
    },
    "application/n-quads": {
      source: "iana",
      extensions: ["nq"]
    },
    "application/n-triples": {
      source: "iana",
      extensions: ["nt"]
    },
    "application/nasdata": {
      source: "iana"
    },
    "application/news-checkgroups": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-groupinfo": {
      source: "iana",
      charset: "US-ASCII"
    },
    "application/news-transmission": {
      source: "iana"
    },
    "application/nlsml+xml": {
      source: "iana",
      compressible: true
    },
    "application/node": {
      source: "iana",
      extensions: ["cjs"]
    },
    "application/nss": {
      source: "iana"
    },
    "application/oauth-authz-req+jwt": {
      source: "iana"
    },
    "application/oblivious-dns-message": {
      source: "iana"
    },
    "application/ocsp-request": {
      source: "iana"
    },
    "application/ocsp-response": {
      source: "iana"
    },
    "application/octet-stream": {
      source: "iana",
      compressible: false,
      extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
    },
    "application/oda": {
      source: "iana",
      extensions: ["oda"]
    },
    "application/odm+xml": {
      source: "iana",
      compressible: true
    },
    "application/odx": {
      source: "iana"
    },
    "application/oebps-package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["opf"]
    },
    "application/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogx"]
    },
    "application/omdoc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["omdoc"]
    },
    "application/onenote": {
      source: "apache",
      extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
    },
    "application/opc-nodeset+xml": {
      source: "iana",
      compressible: true
    },
    "application/oscore": {
      source: "iana"
    },
    "application/oxps": {
      source: "iana",
      extensions: ["oxps"]
    },
    "application/p21": {
      source: "iana"
    },
    "application/p21+zip": {
      source: "iana",
      compressible: false
    },
    "application/p2p-overlay+xml": {
      source: "iana",
      compressible: true,
      extensions: ["relo"]
    },
    "application/parityfec": {
      source: "iana"
    },
    "application/passport": {
      source: "iana"
    },
    "application/patch-ops-error+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xer"]
    },
    "application/pdf": {
      source: "iana",
      compressible: false,
      extensions: ["pdf"]
    },
    "application/pdx": {
      source: "iana"
    },
    "application/pem-certificate-chain": {
      source: "iana"
    },
    "application/pgp-encrypted": {
      source: "iana",
      compressible: false,
      extensions: ["pgp"]
    },
    "application/pgp-keys": {
      source: "iana",
      extensions: ["asc"]
    },
    "application/pgp-signature": {
      source: "iana",
      extensions: ["asc", "sig"]
    },
    "application/pics-rules": {
      source: "apache",
      extensions: ["prf"]
    },
    "application/pidf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pidf-diff+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/pkcs10": {
      source: "iana",
      extensions: ["p10"]
    },
    "application/pkcs12": {
      source: "iana"
    },
    "application/pkcs7-mime": {
      source: "iana",
      extensions: ["p7m", "p7c"]
    },
    "application/pkcs7-signature": {
      source: "iana",
      extensions: ["p7s"]
    },
    "application/pkcs8": {
      source: "iana",
      extensions: ["p8"]
    },
    "application/pkcs8-encrypted": {
      source: "iana"
    },
    "application/pkix-attr-cert": {
      source: "iana",
      extensions: ["ac"]
    },
    "application/pkix-cert": {
      source: "iana",
      extensions: ["cer"]
    },
    "application/pkix-crl": {
      source: "iana",
      extensions: ["crl"]
    },
    "application/pkix-pkipath": {
      source: "iana",
      extensions: ["pkipath"]
    },
    "application/pkixcmp": {
      source: "iana",
      extensions: ["pki"]
    },
    "application/pls+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pls"]
    },
    "application/poc-settings+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/postscript": {
      source: "iana",
      compressible: true,
      extensions: ["ai", "eps", "ps"]
    },
    "application/ppsp-tracker+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+json": {
      source: "iana",
      compressible: true
    },
    "application/problem+xml": {
      source: "iana",
      compressible: true
    },
    "application/provenance+xml": {
      source: "iana",
      compressible: true,
      extensions: ["provx"]
    },
    "application/prs.alvestrand.titrax-sheet": {
      source: "iana"
    },
    "application/prs.cww": {
      source: "iana",
      extensions: ["cww"]
    },
    "application/prs.cyn": {
      source: "iana",
      charset: "7-BIT"
    },
    "application/prs.hpub+zip": {
      source: "iana",
      compressible: false
    },
    "application/prs.nprend": {
      source: "iana"
    },
    "application/prs.plucker": {
      source: "iana"
    },
    "application/prs.rdf-xml-crypt": {
      source: "iana"
    },
    "application/prs.xsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/pskc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["pskcxml"]
    },
    "application/pvd+json": {
      source: "iana",
      compressible: true
    },
    "application/qsig": {
      source: "iana"
    },
    "application/raml+yaml": {
      compressible: true,
      extensions: ["raml"]
    },
    "application/raptorfec": {
      source: "iana"
    },
    "application/rdap+json": {
      source: "iana",
      compressible: true
    },
    "application/rdf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rdf", "owl"]
    },
    "application/reginfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rif"]
    },
    "application/relax-ng-compact-syntax": {
      source: "iana",
      extensions: ["rnc"]
    },
    "application/remote-printing": {
      source: "iana"
    },
    "application/reputon+json": {
      source: "iana",
      compressible: true
    },
    "application/resource-lists+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rl"]
    },
    "application/resource-lists-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rld"]
    },
    "application/rfc+xml": {
      source: "iana",
      compressible: true
    },
    "application/riscos": {
      source: "iana"
    },
    "application/rlmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/rls-services+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rs"]
    },
    "application/route-apd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rapd"]
    },
    "application/route-s-tsid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sls"]
    },
    "application/route-usd+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rusd"]
    },
    "application/rpki-ghostbusters": {
      source: "iana",
      extensions: ["gbr"]
    },
    "application/rpki-manifest": {
      source: "iana",
      extensions: ["mft"]
    },
    "application/rpki-publication": {
      source: "iana"
    },
    "application/rpki-roa": {
      source: "iana",
      extensions: ["roa"]
    },
    "application/rpki-updown": {
      source: "iana"
    },
    "application/rsd+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rsd"]
    },
    "application/rss+xml": {
      source: "apache",
      compressible: true,
      extensions: ["rss"]
    },
    "application/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "application/rtploopback": {
      source: "iana"
    },
    "application/rtx": {
      source: "iana"
    },
    "application/samlassertion+xml": {
      source: "iana",
      compressible: true
    },
    "application/samlmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/sarif+json": {
      source: "iana",
      compressible: true
    },
    "application/sarif-external-properties+json": {
      source: "iana",
      compressible: true
    },
    "application/sbe": {
      source: "iana"
    },
    "application/sbml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sbml"]
    },
    "application/scaip+xml": {
      source: "iana",
      compressible: true
    },
    "application/scim+json": {
      source: "iana",
      compressible: true
    },
    "application/scvp-cv-request": {
      source: "iana",
      extensions: ["scq"]
    },
    "application/scvp-cv-response": {
      source: "iana",
      extensions: ["scs"]
    },
    "application/scvp-vp-request": {
      source: "iana",
      extensions: ["spq"]
    },
    "application/scvp-vp-response": {
      source: "iana",
      extensions: ["spp"]
    },
    "application/sdp": {
      source: "iana",
      extensions: ["sdp"]
    },
    "application/secevent+jwt": {
      source: "iana"
    },
    "application/senml+cbor": {
      source: "iana"
    },
    "application/senml+json": {
      source: "iana",
      compressible: true
    },
    "application/senml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["senmlx"]
    },
    "application/senml-etch+cbor": {
      source: "iana"
    },
    "application/senml-etch+json": {
      source: "iana",
      compressible: true
    },
    "application/senml-exi": {
      source: "iana"
    },
    "application/sensml+cbor": {
      source: "iana"
    },
    "application/sensml+json": {
      source: "iana",
      compressible: true
    },
    "application/sensml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sensmlx"]
    },
    "application/sensml-exi": {
      source: "iana"
    },
    "application/sep+xml": {
      source: "iana",
      compressible: true
    },
    "application/sep-exi": {
      source: "iana"
    },
    "application/session-info": {
      source: "iana"
    },
    "application/set-payment": {
      source: "iana"
    },
    "application/set-payment-initiation": {
      source: "iana",
      extensions: ["setpay"]
    },
    "application/set-registration": {
      source: "iana"
    },
    "application/set-registration-initiation": {
      source: "iana",
      extensions: ["setreg"]
    },
    "application/sgml": {
      source: "iana"
    },
    "application/sgml-open-catalog": {
      source: "iana"
    },
    "application/shf+xml": {
      source: "iana",
      compressible: true,
      extensions: ["shf"]
    },
    "application/sieve": {
      source: "iana",
      extensions: ["siv", "sieve"]
    },
    "application/simple-filter+xml": {
      source: "iana",
      compressible: true
    },
    "application/simple-message-summary": {
      source: "iana"
    },
    "application/simplesymbolcontainer": {
      source: "iana"
    },
    "application/sipc": {
      source: "iana"
    },
    "application/slate": {
      source: "iana"
    },
    "application/smil": {
      source: "iana"
    },
    "application/smil+xml": {
      source: "iana",
      compressible: true,
      extensions: ["smi", "smil"]
    },
    "application/smpte336m": {
      source: "iana"
    },
    "application/soap+fastinfoset": {
      source: "iana"
    },
    "application/soap+xml": {
      source: "iana",
      compressible: true
    },
    "application/sparql-query": {
      source: "iana",
      extensions: ["rq"]
    },
    "application/sparql-results+xml": {
      source: "iana",
      compressible: true,
      extensions: ["srx"]
    },
    "application/spdx+json": {
      source: "iana",
      compressible: true
    },
    "application/spirits-event+xml": {
      source: "iana",
      compressible: true
    },
    "application/sql": {
      source: "iana"
    },
    "application/srgs": {
      source: "iana",
      extensions: ["gram"]
    },
    "application/srgs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["grxml"]
    },
    "application/sru+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sru"]
    },
    "application/ssdl+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ssdl"]
    },
    "application/ssml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ssml"]
    },
    "application/stix+json": {
      source: "iana",
      compressible: true
    },
    "application/swid+xml": {
      source: "iana",
      compressible: true,
      extensions: ["swidtag"]
    },
    "application/tamp-apex-update": {
      source: "iana"
    },
    "application/tamp-apex-update-confirm": {
      source: "iana"
    },
    "application/tamp-community-update": {
      source: "iana"
    },
    "application/tamp-community-update-confirm": {
      source: "iana"
    },
    "application/tamp-error": {
      source: "iana"
    },
    "application/tamp-sequence-adjust": {
      source: "iana"
    },
    "application/tamp-sequence-adjust-confirm": {
      source: "iana"
    },
    "application/tamp-status-query": {
      source: "iana"
    },
    "application/tamp-status-response": {
      source: "iana"
    },
    "application/tamp-update": {
      source: "iana"
    },
    "application/tamp-update-confirm": {
      source: "iana"
    },
    "application/tar": {
      compressible: true
    },
    "application/taxii+json": {
      source: "iana",
      compressible: true
    },
    "application/td+json": {
      source: "iana",
      compressible: true
    },
    "application/tei+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tei", "teicorpus"]
    },
    "application/tetra_isi": {
      source: "iana"
    },
    "application/thraud+xml": {
      source: "iana",
      compressible: true,
      extensions: ["tfi"]
    },
    "application/timestamp-query": {
      source: "iana"
    },
    "application/timestamp-reply": {
      source: "iana"
    },
    "application/timestamped-data": {
      source: "iana",
      extensions: ["tsd"]
    },
    "application/tlsrpt+gzip": {
      source: "iana"
    },
    "application/tlsrpt+json": {
      source: "iana",
      compressible: true
    },
    "application/tnauthlist": {
      source: "iana"
    },
    "application/token-introspection+jwt": {
      source: "iana"
    },
    "application/toml": {
      compressible: true,
      extensions: ["toml"]
    },
    "application/trickle-ice-sdpfrag": {
      source: "iana"
    },
    "application/trig": {
      source: "iana",
      extensions: ["trig"]
    },
    "application/ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ttml"]
    },
    "application/tve-trigger": {
      source: "iana"
    },
    "application/tzif": {
      source: "iana"
    },
    "application/tzif-leap": {
      source: "iana"
    },
    "application/ubjson": {
      compressible: false,
      extensions: ["ubj"]
    },
    "application/ulpfec": {
      source: "iana"
    },
    "application/urc-grpsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/urc-ressheet+xml": {
      source: "iana",
      compressible: true,
      extensions: ["rsheet"]
    },
    "application/urc-targetdesc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["td"]
    },
    "application/urc-uisocketdesc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vcard+json": {
      source: "iana",
      compressible: true
    },
    "application/vcard+xml": {
      source: "iana",
      compressible: true
    },
    "application/vemmi": {
      source: "iana"
    },
    "application/vividence.scriptfile": {
      source: "apache"
    },
    "application/vnd.1000minds.decision-model+xml": {
      source: "iana",
      compressible: true,
      extensions: ["1km"]
    },
    "application/vnd.3gpp-prose+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-prose-pc3ch+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp-v2x-local-service-information": {
      source: "iana"
    },
    "application/vnd.3gpp.5gnas": {
      source: "iana"
    },
    "application/vnd.3gpp.access-transfer-events+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.bsf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gmop+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.gtpc": {
      source: "iana"
    },
    "application/vnd.3gpp.interworking-data": {
      source: "iana"
    },
    "application/vnd.3gpp.lpp": {
      source: "iana"
    },
    "application/vnd.3gpp.mc-signalling-ear": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-payload": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-signalling": {
      source: "iana"
    },
    "application/vnd.3gpp.mcdata-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcdata-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-floor-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-signed+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-ue-init-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcptt-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-location-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-service-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-transmission-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-ue-config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mcvideo-user-profile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.mid-call+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ngap": {
      source: "iana"
    },
    "application/vnd.3gpp.pfcp": {
      source: "iana"
    },
    "application/vnd.3gpp.pic-bw-large": {
      source: "iana",
      extensions: ["plb"]
    },
    "application/vnd.3gpp.pic-bw-small": {
      source: "iana",
      extensions: ["psb"]
    },
    "application/vnd.3gpp.pic-bw-var": {
      source: "iana",
      extensions: ["pvb"]
    },
    "application/vnd.3gpp.s1ap": {
      source: "iana"
    },
    "application/vnd.3gpp.sms": {
      source: "iana"
    },
    "application/vnd.3gpp.sms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-ext+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.srvcc-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.state-and-event-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp.ussd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.bcmcsinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.3gpp2.sms": {
      source: "iana"
    },
    "application/vnd.3gpp2.tcap": {
      source: "iana",
      extensions: ["tcap"]
    },
    "application/vnd.3lightssoftware.imagescal": {
      source: "iana"
    },
    "application/vnd.3m.post-it-notes": {
      source: "iana",
      extensions: ["pwn"]
    },
    "application/vnd.accpac.simply.aso": {
      source: "iana",
      extensions: ["aso"]
    },
    "application/vnd.accpac.simply.imp": {
      source: "iana",
      extensions: ["imp"]
    },
    "application/vnd.acucobol": {
      source: "iana",
      extensions: ["acu"]
    },
    "application/vnd.acucorp": {
      source: "iana",
      extensions: ["atc", "acutc"]
    },
    "application/vnd.adobe.air-application-installer-package+zip": {
      source: "apache",
      compressible: false,
      extensions: ["air"]
    },
    "application/vnd.adobe.flash.movie": {
      source: "iana"
    },
    "application/vnd.adobe.formscentral.fcdt": {
      source: "iana",
      extensions: ["fcdt"]
    },
    "application/vnd.adobe.fxp": {
      source: "iana",
      extensions: ["fxp", "fxpl"]
    },
    "application/vnd.adobe.partial-upload": {
      source: "iana"
    },
    "application/vnd.adobe.xdp+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdp"]
    },
    "application/vnd.adobe.xfdf": {
      source: "iana",
      extensions: ["xfdf"]
    },
    "application/vnd.aether.imp": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata": {
      source: "iana"
    },
    "application/vnd.afpc.afplinedata-pagedef": {
      source: "iana"
    },
    "application/vnd.afpc.cmoca-cmresource": {
      source: "iana"
    },
    "application/vnd.afpc.foca-charset": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codedfont": {
      source: "iana"
    },
    "application/vnd.afpc.foca-codepage": {
      source: "iana"
    },
    "application/vnd.afpc.modca": {
      source: "iana"
    },
    "application/vnd.afpc.modca-cmtable": {
      source: "iana"
    },
    "application/vnd.afpc.modca-formdef": {
      source: "iana"
    },
    "application/vnd.afpc.modca-mediummap": {
      source: "iana"
    },
    "application/vnd.afpc.modca-objectcontainer": {
      source: "iana"
    },
    "application/vnd.afpc.modca-overlay": {
      source: "iana"
    },
    "application/vnd.afpc.modca-pagesegment": {
      source: "iana"
    },
    "application/vnd.age": {
      source: "iana",
      extensions: ["age"]
    },
    "application/vnd.ah-barcode": {
      source: "iana"
    },
    "application/vnd.ahead.space": {
      source: "iana",
      extensions: ["ahead"]
    },
    "application/vnd.airzip.filesecure.azf": {
      source: "iana",
      extensions: ["azf"]
    },
    "application/vnd.airzip.filesecure.azs": {
      source: "iana",
      extensions: ["azs"]
    },
    "application/vnd.amadeus+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.amazon.ebook": {
      source: "apache",
      extensions: ["azw"]
    },
    "application/vnd.amazon.mobi8-ebook": {
      source: "iana"
    },
    "application/vnd.americandynamics.acc": {
      source: "iana",
      extensions: ["acc"]
    },
    "application/vnd.amiga.ami": {
      source: "iana",
      extensions: ["ami"]
    },
    "application/vnd.amundsen.maze+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.android.ota": {
      source: "iana"
    },
    "application/vnd.android.package-archive": {
      source: "apache",
      compressible: false,
      extensions: ["apk"]
    },
    "application/vnd.anki": {
      source: "iana"
    },
    "application/vnd.anser-web-certificate-issue-initiation": {
      source: "iana",
      extensions: ["cii"]
    },
    "application/vnd.anser-web-funds-transfer-initiation": {
      source: "apache",
      extensions: ["fti"]
    },
    "application/vnd.antix.game-component": {
      source: "iana",
      extensions: ["atx"]
    },
    "application/vnd.apache.arrow.file": {
      source: "iana"
    },
    "application/vnd.apache.arrow.stream": {
      source: "iana"
    },
    "application/vnd.apache.thrift.binary": {
      source: "iana"
    },
    "application/vnd.apache.thrift.compact": {
      source: "iana"
    },
    "application/vnd.apache.thrift.json": {
      source: "iana"
    },
    "application/vnd.api+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.aplextor.warrp+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apothekende.reservation+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.apple.installer+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mpkg"]
    },
    "application/vnd.apple.keynote": {
      source: "iana",
      extensions: ["key"]
    },
    "application/vnd.apple.mpegurl": {
      source: "iana",
      extensions: ["m3u8"]
    },
    "application/vnd.apple.numbers": {
      source: "iana",
      extensions: ["numbers"]
    },
    "application/vnd.apple.pages": {
      source: "iana",
      extensions: ["pages"]
    },
    "application/vnd.apple.pkpass": {
      compressible: false,
      extensions: ["pkpass"]
    },
    "application/vnd.arastra.swi": {
      source: "iana"
    },
    "application/vnd.aristanetworks.swi": {
      source: "iana",
      extensions: ["swi"]
    },
    "application/vnd.artisan+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.artsquare": {
      source: "iana"
    },
    "application/vnd.astraea-software.iota": {
      source: "iana",
      extensions: ["iota"]
    },
    "application/vnd.audiograph": {
      source: "iana",
      extensions: ["aep"]
    },
    "application/vnd.autopackage": {
      source: "iana"
    },
    "application/vnd.avalon+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.avistar+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.balsamiq.bmml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["bmml"]
    },
    "application/vnd.balsamiq.bmpr": {
      source: "iana"
    },
    "application/vnd.banana-accounting": {
      source: "iana"
    },
    "application/vnd.bbf.usp.error": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg": {
      source: "iana"
    },
    "application/vnd.bbf.usp.msg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bekitzur-stech+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.bint.med-content": {
      source: "iana"
    },
    "application/vnd.biopax.rdf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.blink-idb-value-wrapper": {
      source: "iana"
    },
    "application/vnd.blueice.multipass": {
      source: "iana",
      extensions: ["mpm"]
    },
    "application/vnd.bluetooth.ep.oob": {
      source: "iana"
    },
    "application/vnd.bluetooth.le.oob": {
      source: "iana"
    },
    "application/vnd.bmi": {
      source: "iana",
      extensions: ["bmi"]
    },
    "application/vnd.bpf": {
      source: "iana"
    },
    "application/vnd.bpf3": {
      source: "iana"
    },
    "application/vnd.businessobjects": {
      source: "iana",
      extensions: ["rep"]
    },
    "application/vnd.byu.uapi+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cab-jscript": {
      source: "iana"
    },
    "application/vnd.canon-cpdl": {
      source: "iana"
    },
    "application/vnd.canon-lips": {
      source: "iana"
    },
    "application/vnd.capasystems-pg+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cendio.thinlinc.clientconf": {
      source: "iana"
    },
    "application/vnd.century-systems.tcp_stream": {
      source: "iana"
    },
    "application/vnd.chemdraw+xml": {
      source: "iana",
      compressible: true,
      extensions: ["cdxml"]
    },
    "application/vnd.chess-pgn": {
      source: "iana"
    },
    "application/vnd.chipnuts.karaoke-mmd": {
      source: "iana",
      extensions: ["mmd"]
    },
    "application/vnd.ciedi": {
      source: "iana"
    },
    "application/vnd.cinderella": {
      source: "iana",
      extensions: ["cdy"]
    },
    "application/vnd.cirpack.isdn-ext": {
      source: "iana"
    },
    "application/vnd.citationstyles.style+xml": {
      source: "iana",
      compressible: true,
      extensions: ["csl"]
    },
    "application/vnd.claymore": {
      source: "iana",
      extensions: ["cla"]
    },
    "application/vnd.cloanto.rp9": {
      source: "iana",
      extensions: ["rp9"]
    },
    "application/vnd.clonk.c4group": {
      source: "iana",
      extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
    },
    "application/vnd.cluetrust.cartomobile-config": {
      source: "iana",
      extensions: ["c11amc"]
    },
    "application/vnd.cluetrust.cartomobile-config-pkg": {
      source: "iana",
      extensions: ["c11amz"]
    },
    "application/vnd.coffeescript": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.document-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.presentation-template": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet": {
      source: "iana"
    },
    "application/vnd.collabio.xodocuments.spreadsheet-template": {
      source: "iana"
    },
    "application/vnd.collection+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.doc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.collection.next+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.comicbook+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.comicbook-rar": {
      source: "iana"
    },
    "application/vnd.commerce-battelle": {
      source: "iana"
    },
    "application/vnd.commonspace": {
      source: "iana",
      extensions: ["csp"]
    },
    "application/vnd.contact.cmsg": {
      source: "iana",
      extensions: ["cdbcmsg"]
    },
    "application/vnd.coreos.ignition+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cosmocaller": {
      source: "iana",
      extensions: ["cmc"]
    },
    "application/vnd.crick.clicker": {
      source: "iana",
      extensions: ["clkx"]
    },
    "application/vnd.crick.clicker.keyboard": {
      source: "iana",
      extensions: ["clkk"]
    },
    "application/vnd.crick.clicker.palette": {
      source: "iana",
      extensions: ["clkp"]
    },
    "application/vnd.crick.clicker.template": {
      source: "iana",
      extensions: ["clkt"]
    },
    "application/vnd.crick.clicker.wordbank": {
      source: "iana",
      extensions: ["clkw"]
    },
    "application/vnd.criticaltools.wbs+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wbs"]
    },
    "application/vnd.cryptii.pipe+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.crypto-shade-file": {
      source: "iana"
    },
    "application/vnd.cryptomator.encrypted": {
      source: "iana"
    },
    "application/vnd.cryptomator.vault": {
      source: "iana"
    },
    "application/vnd.ctc-posml": {
      source: "iana",
      extensions: ["pml"]
    },
    "application/vnd.ctct.ws+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cups-pdf": {
      source: "iana"
    },
    "application/vnd.cups-postscript": {
      source: "iana"
    },
    "application/vnd.cups-ppd": {
      source: "iana",
      extensions: ["ppd"]
    },
    "application/vnd.cups-raster": {
      source: "iana"
    },
    "application/vnd.cups-raw": {
      source: "iana"
    },
    "application/vnd.curl": {
      source: "iana"
    },
    "application/vnd.curl.car": {
      source: "apache",
      extensions: ["car"]
    },
    "application/vnd.curl.pcurl": {
      source: "apache",
      extensions: ["pcurl"]
    },
    "application/vnd.cyan.dean.root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cybank": {
      source: "iana"
    },
    "application/vnd.cyclonedx+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.cyclonedx+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.d2l.coursepackage1p0+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.d3m-dataset": {
      source: "iana"
    },
    "application/vnd.d3m-problem": {
      source: "iana"
    },
    "application/vnd.dart": {
      source: "iana",
      compressible: true,
      extensions: ["dart"]
    },
    "application/vnd.data-vision.rdz": {
      source: "iana",
      extensions: ["rdz"]
    },
    "application/vnd.datapackage+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dataresource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dbf": {
      source: "iana",
      extensions: ["dbf"]
    },
    "application/vnd.debian.binary-package": {
      source: "iana"
    },
    "application/vnd.dece.data": {
      source: "iana",
      extensions: ["uvf", "uvvf", "uvd", "uvvd"]
    },
    "application/vnd.dece.ttml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uvt", "uvvt"]
    },
    "application/vnd.dece.unspecified": {
      source: "iana",
      extensions: ["uvx", "uvvx"]
    },
    "application/vnd.dece.zip": {
      source: "iana",
      extensions: ["uvz", "uvvz"]
    },
    "application/vnd.denovo.fcselayout-link": {
      source: "iana",
      extensions: ["fe_launch"]
    },
    "application/vnd.desmume.movie": {
      source: "iana"
    },
    "application/vnd.dir-bi.plate-dl-nosuffix": {
      source: "iana"
    },
    "application/vnd.dm.delegation+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dna": {
      source: "iana",
      extensions: ["dna"]
    },
    "application/vnd.document+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dolby.mlp": {
      source: "apache",
      extensions: ["mlp"]
    },
    "application/vnd.dolby.mobile.1": {
      source: "iana"
    },
    "application/vnd.dolby.mobile.2": {
      source: "iana"
    },
    "application/vnd.doremir.scorecloud-binary-document": {
      source: "iana"
    },
    "application/vnd.dpgraph": {
      source: "iana",
      extensions: ["dpg"]
    },
    "application/vnd.dreamfactory": {
      source: "iana",
      extensions: ["dfac"]
    },
    "application/vnd.drive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ds-keypoint": {
      source: "apache",
      extensions: ["kpxx"]
    },
    "application/vnd.dtg.local": {
      source: "iana"
    },
    "application/vnd.dtg.local.flash": {
      source: "iana"
    },
    "application/vnd.dtg.local.html": {
      source: "iana"
    },
    "application/vnd.dvb.ait": {
      source: "iana",
      extensions: ["ait"]
    },
    "application/vnd.dvb.dvbisl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.dvbj": {
      source: "iana"
    },
    "application/vnd.dvb.esgcontainer": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcdftnotifaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgaccess2": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcesgpdd": {
      source: "iana"
    },
    "application/vnd.dvb.ipdcroaming": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-base": {
      source: "iana"
    },
    "application/vnd.dvb.iptv.alfec-enhancement": {
      source: "iana"
    },
    "application/vnd.dvb.notif-aggregate-root+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-container+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-generic+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-msglist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-ia-registration-response+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.notif-init+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.dvb.pfr": {
      source: "iana"
    },
    "application/vnd.dvb.service": {
      source: "iana",
      extensions: ["svc"]
    },
    "application/vnd.dxr": {
      source: "iana"
    },
    "application/vnd.dynageo": {
      source: "iana",
      extensions: ["geo"]
    },
    "application/vnd.dzr": {
      source: "iana"
    },
    "application/vnd.easykaraoke.cdgdownload": {
      source: "iana"
    },
    "application/vnd.ecdis-update": {
      source: "iana"
    },
    "application/vnd.ecip.rlp": {
      source: "iana"
    },
    "application/vnd.eclipse.ditto+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ecowin.chart": {
      source: "iana",
      extensions: ["mag"]
    },
    "application/vnd.ecowin.filerequest": {
      source: "iana"
    },
    "application/vnd.ecowin.fileupdate": {
      source: "iana"
    },
    "application/vnd.ecowin.series": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesrequest": {
      source: "iana"
    },
    "application/vnd.ecowin.seriesupdate": {
      source: "iana"
    },
    "application/vnd.efi.img": {
      source: "iana"
    },
    "application/vnd.efi.iso": {
      source: "iana"
    },
    "application/vnd.emclient.accessrequest+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.enliven": {
      source: "iana",
      extensions: ["nml"]
    },
    "application/vnd.enphase.envoy": {
      source: "iana"
    },
    "application/vnd.eprints.data+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.epson.esf": {
      source: "iana",
      extensions: ["esf"]
    },
    "application/vnd.epson.msf": {
      source: "iana",
      extensions: ["msf"]
    },
    "application/vnd.epson.quickanime": {
      source: "iana",
      extensions: ["qam"]
    },
    "application/vnd.epson.salt": {
      source: "iana",
      extensions: ["slt"]
    },
    "application/vnd.epson.ssf": {
      source: "iana",
      extensions: ["ssf"]
    },
    "application/vnd.ericsson.quickcall": {
      source: "iana"
    },
    "application/vnd.espass-espass+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.eszigno3+xml": {
      source: "iana",
      compressible: true,
      extensions: ["es3", "et3"]
    },
    "application/vnd.etsi.aoc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.asic-e+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.asic-s+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.etsi.cug+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvcommand+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-bc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-cod+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsad-npvr+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvservice+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvsync+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.iptvueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mcid+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.mheg5": {
      source: "iana"
    },
    "application/vnd.etsi.overload-control-policy-dataset+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.pstn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.sci+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.simservs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.timestamp-token": {
      source: "iana"
    },
    "application/vnd.etsi.tsl+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.etsi.tsl.der": {
      source: "iana"
    },
    "application/vnd.eu.kasparian.car+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.eudora.data": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.profile": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.settings": {
      source: "iana"
    },
    "application/vnd.evolv.ecig.theme": {
      source: "iana"
    },
    "application/vnd.exstream-empower+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.exstream-package": {
      source: "iana"
    },
    "application/vnd.ezpix-album": {
      source: "iana",
      extensions: ["ez2"]
    },
    "application/vnd.ezpix-package": {
      source: "iana",
      extensions: ["ez3"]
    },
    "application/vnd.f-secure.mobile": {
      source: "iana"
    },
    "application/vnd.familysearch.gedcom+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.fastcopy-disk-image": {
      source: "iana"
    },
    "application/vnd.fdf": {
      source: "iana",
      extensions: ["fdf"]
    },
    "application/vnd.fdsn.mseed": {
      source: "iana",
      extensions: ["mseed"]
    },
    "application/vnd.fdsn.seed": {
      source: "iana",
      extensions: ["seed", "dataless"]
    },
    "application/vnd.ffsns": {
      source: "iana"
    },
    "application/vnd.ficlab.flb+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.filmit.zfc": {
      source: "iana"
    },
    "application/vnd.fints": {
      source: "iana"
    },
    "application/vnd.firemonkeys.cloudcell": {
      source: "iana"
    },
    "application/vnd.flographit": {
      source: "iana",
      extensions: ["gph"]
    },
    "application/vnd.fluxtime.clip": {
      source: "iana",
      extensions: ["ftc"]
    },
    "application/vnd.font-fontforge-sfd": {
      source: "iana"
    },
    "application/vnd.framemaker": {
      source: "iana",
      extensions: ["fm", "frame", "maker", "book"]
    },
    "application/vnd.frogans.fnc": {
      source: "iana",
      extensions: ["fnc"]
    },
    "application/vnd.frogans.ltf": {
      source: "iana",
      extensions: ["ltf"]
    },
    "application/vnd.fsc.weblaunch": {
      source: "iana",
      extensions: ["fsc"]
    },
    "application/vnd.fujifilm.fb.docuworks": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.binder": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujifilm.fb.jfi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fujitsu.oasys": {
      source: "iana",
      extensions: ["oas"]
    },
    "application/vnd.fujitsu.oasys2": {
      source: "iana",
      extensions: ["oa2"]
    },
    "application/vnd.fujitsu.oasys3": {
      source: "iana",
      extensions: ["oa3"]
    },
    "application/vnd.fujitsu.oasysgp": {
      source: "iana",
      extensions: ["fg5"]
    },
    "application/vnd.fujitsu.oasysprs": {
      source: "iana",
      extensions: ["bh2"]
    },
    "application/vnd.fujixerox.art-ex": {
      source: "iana"
    },
    "application/vnd.fujixerox.art4": {
      source: "iana"
    },
    "application/vnd.fujixerox.ddd": {
      source: "iana",
      extensions: ["ddd"]
    },
    "application/vnd.fujixerox.docuworks": {
      source: "iana",
      extensions: ["xdw"]
    },
    "application/vnd.fujixerox.docuworks.binder": {
      source: "iana",
      extensions: ["xbd"]
    },
    "application/vnd.fujixerox.docuworks.container": {
      source: "iana"
    },
    "application/vnd.fujixerox.hbpl": {
      source: "iana"
    },
    "application/vnd.fut-misnet": {
      source: "iana"
    },
    "application/vnd.futoin+cbor": {
      source: "iana"
    },
    "application/vnd.futoin+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.fuzzysheet": {
      source: "iana",
      extensions: ["fzs"]
    },
    "application/vnd.genomatix.tuxedo": {
      source: "iana",
      extensions: ["txd"]
    },
    "application/vnd.gentics.grd+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geo+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geocube+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.geogebra.file": {
      source: "iana",
      extensions: ["ggb"]
    },
    "application/vnd.geogebra.slides": {
      source: "iana"
    },
    "application/vnd.geogebra.tool": {
      source: "iana",
      extensions: ["ggt"]
    },
    "application/vnd.geometry-explorer": {
      source: "iana",
      extensions: ["gex", "gre"]
    },
    "application/vnd.geonext": {
      source: "iana",
      extensions: ["gxt"]
    },
    "application/vnd.geoplan": {
      source: "iana",
      extensions: ["g2w"]
    },
    "application/vnd.geospace": {
      source: "iana",
      extensions: ["g3w"]
    },
    "application/vnd.gerber": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt": {
      source: "iana"
    },
    "application/vnd.globalplatform.card-content-mgt-response": {
      source: "iana"
    },
    "application/vnd.gmx": {
      source: "iana",
      extensions: ["gmx"]
    },
    "application/vnd.google-apps.document": {
      compressible: false,
      extensions: ["gdoc"]
    },
    "application/vnd.google-apps.presentation": {
      compressible: false,
      extensions: ["gslides"]
    },
    "application/vnd.google-apps.spreadsheet": {
      compressible: false,
      extensions: ["gsheet"]
    },
    "application/vnd.google-earth.kml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["kml"]
    },
    "application/vnd.google-earth.kmz": {
      source: "iana",
      compressible: false,
      extensions: ["kmz"]
    },
    "application/vnd.gov.sk.e-form+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.gov.sk.e-form+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.gov.sk.xmldatacontainer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.grafeq": {
      source: "iana",
      extensions: ["gqf", "gqs"]
    },
    "application/vnd.gridmp": {
      source: "iana"
    },
    "application/vnd.groove-account": {
      source: "iana",
      extensions: ["gac"]
    },
    "application/vnd.groove-help": {
      source: "iana",
      extensions: ["ghf"]
    },
    "application/vnd.groove-identity-message": {
      source: "iana",
      extensions: ["gim"]
    },
    "application/vnd.groove-injector": {
      source: "iana",
      extensions: ["grv"]
    },
    "application/vnd.groove-tool-message": {
      source: "iana",
      extensions: ["gtm"]
    },
    "application/vnd.groove-tool-template": {
      source: "iana",
      extensions: ["tpl"]
    },
    "application/vnd.groove-vcard": {
      source: "iana",
      extensions: ["vcg"]
    },
    "application/vnd.hal+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hal+xml": {
      source: "iana",
      compressible: true,
      extensions: ["hal"]
    },
    "application/vnd.handheld-entertainment+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zmm"]
    },
    "application/vnd.hbci": {
      source: "iana",
      extensions: ["hbci"]
    },
    "application/vnd.hc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hcl-bireports": {
      source: "iana"
    },
    "application/vnd.hdt": {
      source: "iana"
    },
    "application/vnd.heroku+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hhe.lesson-player": {
      source: "iana",
      extensions: ["les"]
    },
    "application/vnd.hl7cda+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hl7v2+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.hp-hpgl": {
      source: "iana",
      extensions: ["hpgl"]
    },
    "application/vnd.hp-hpid": {
      source: "iana",
      extensions: ["hpid"]
    },
    "application/vnd.hp-hps": {
      source: "iana",
      extensions: ["hps"]
    },
    "application/vnd.hp-jlyt": {
      source: "iana",
      extensions: ["jlt"]
    },
    "application/vnd.hp-pcl": {
      source: "iana",
      extensions: ["pcl"]
    },
    "application/vnd.hp-pclxl": {
      source: "iana",
      extensions: ["pclxl"]
    },
    "application/vnd.httphone": {
      source: "iana"
    },
    "application/vnd.hydrostatix.sof-data": {
      source: "iana",
      extensions: ["sfd-hdstx"]
    },
    "application/vnd.hyper+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyper-item+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hyperdrive+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.hzn-3d-crossword": {
      source: "iana"
    },
    "application/vnd.ibm.afplinedata": {
      source: "iana"
    },
    "application/vnd.ibm.electronic-media": {
      source: "iana"
    },
    "application/vnd.ibm.minipay": {
      source: "iana",
      extensions: ["mpy"]
    },
    "application/vnd.ibm.modcap": {
      source: "iana",
      extensions: ["afp", "listafp", "list3820"]
    },
    "application/vnd.ibm.rights-management": {
      source: "iana",
      extensions: ["irm"]
    },
    "application/vnd.ibm.secure-container": {
      source: "iana",
      extensions: ["sc"]
    },
    "application/vnd.iccprofile": {
      source: "iana",
      extensions: ["icc", "icm"]
    },
    "application/vnd.ieee.1905": {
      source: "iana"
    },
    "application/vnd.igloader": {
      source: "iana",
      extensions: ["igl"]
    },
    "application/vnd.imagemeter.folder+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.imagemeter.image+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.immervision-ivp": {
      source: "iana",
      extensions: ["ivp"]
    },
    "application/vnd.immervision-ivu": {
      source: "iana",
      extensions: ["ivu"]
    },
    "application/vnd.ims.imsccv1p1": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p2": {
      source: "iana"
    },
    "application/vnd.ims.imsccv1p3": {
      source: "iana"
    },
    "application/vnd.ims.lis.v2.result+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolproxy.id+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ims.lti.v2.toolsettings.simple+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informedcontrol.rms+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.informix-visionary": {
      source: "iana"
    },
    "application/vnd.infotech.project": {
      source: "iana"
    },
    "application/vnd.infotech.project+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.innopath.wamp.notification": {
      source: "iana"
    },
    "application/vnd.insors.igm": {
      source: "iana",
      extensions: ["igm"]
    },
    "application/vnd.intercon.formnet": {
      source: "iana",
      extensions: ["xpw", "xpx"]
    },
    "application/vnd.intergeo": {
      source: "iana",
      extensions: ["i2g"]
    },
    "application/vnd.intertrust.digibox": {
      source: "iana"
    },
    "application/vnd.intertrust.nncp": {
      source: "iana"
    },
    "application/vnd.intu.qbo": {
      source: "iana",
      extensions: ["qbo"]
    },
    "application/vnd.intu.qfx": {
      source: "iana",
      extensions: ["qfx"]
    },
    "application/vnd.iptc.g2.catalogitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.conceptitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.knowledgeitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.newsmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.packageitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.iptc.g2.planningitem+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ipunplugged.rcprofile": {
      source: "iana",
      extensions: ["rcprofile"]
    },
    "application/vnd.irepository.package+xml": {
      source: "iana",
      compressible: true,
      extensions: ["irp"]
    },
    "application/vnd.is-xpr": {
      source: "iana",
      extensions: ["xpr"]
    },
    "application/vnd.isac.fcs": {
      source: "iana",
      extensions: ["fcs"]
    },
    "application/vnd.iso11783-10+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.jam": {
      source: "iana",
      extensions: ["jam"]
    },
    "application/vnd.japannet-directory-service": {
      source: "iana"
    },
    "application/vnd.japannet-jpnstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-payment-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-registration": {
      source: "iana"
    },
    "application/vnd.japannet-registration-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-setstore-wakeup": {
      source: "iana"
    },
    "application/vnd.japannet-verification": {
      source: "iana"
    },
    "application/vnd.japannet-verification-wakeup": {
      source: "iana"
    },
    "application/vnd.jcp.javame.midlet-rms": {
      source: "iana",
      extensions: ["rms"]
    },
    "application/vnd.jisp": {
      source: "iana",
      extensions: ["jisp"]
    },
    "application/vnd.joost.joda-archive": {
      source: "iana",
      extensions: ["joda"]
    },
    "application/vnd.jsk.isdn-ngn": {
      source: "iana"
    },
    "application/vnd.kahootz": {
      source: "iana",
      extensions: ["ktz", "ktr"]
    },
    "application/vnd.kde.karbon": {
      source: "iana",
      extensions: ["karbon"]
    },
    "application/vnd.kde.kchart": {
      source: "iana",
      extensions: ["chrt"]
    },
    "application/vnd.kde.kformula": {
      source: "iana",
      extensions: ["kfo"]
    },
    "application/vnd.kde.kivio": {
      source: "iana",
      extensions: ["flw"]
    },
    "application/vnd.kde.kontour": {
      source: "iana",
      extensions: ["kon"]
    },
    "application/vnd.kde.kpresenter": {
      source: "iana",
      extensions: ["kpr", "kpt"]
    },
    "application/vnd.kde.kspread": {
      source: "iana",
      extensions: ["ksp"]
    },
    "application/vnd.kde.kword": {
      source: "iana",
      extensions: ["kwd", "kwt"]
    },
    "application/vnd.kenameaapp": {
      source: "iana",
      extensions: ["htke"]
    },
    "application/vnd.kidspiration": {
      source: "iana",
      extensions: ["kia"]
    },
    "application/vnd.kinar": {
      source: "iana",
      extensions: ["kne", "knp"]
    },
    "application/vnd.koan": {
      source: "iana",
      extensions: ["skp", "skd", "skt", "skm"]
    },
    "application/vnd.kodak-descriptor": {
      source: "iana",
      extensions: ["sse"]
    },
    "application/vnd.las": {
      source: "iana"
    },
    "application/vnd.las.las+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.las.las+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lasxml"]
    },
    "application/vnd.laszip": {
      source: "iana"
    },
    "application/vnd.leap+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.liberty-request+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.llamagraphics.life-balance.desktop": {
      source: "iana",
      extensions: ["lbd"]
    },
    "application/vnd.llamagraphics.life-balance.exchange+xml": {
      source: "iana",
      compressible: true,
      extensions: ["lbe"]
    },
    "application/vnd.logipipe.circuit+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.loom": {
      source: "iana"
    },
    "application/vnd.lotus-1-2-3": {
      source: "iana",
      extensions: ["123"]
    },
    "application/vnd.lotus-approach": {
      source: "iana",
      extensions: ["apr"]
    },
    "application/vnd.lotus-freelance": {
      source: "iana",
      extensions: ["pre"]
    },
    "application/vnd.lotus-notes": {
      source: "iana",
      extensions: ["nsf"]
    },
    "application/vnd.lotus-organizer": {
      source: "iana",
      extensions: ["org"]
    },
    "application/vnd.lotus-screencam": {
      source: "iana",
      extensions: ["scm"]
    },
    "application/vnd.lotus-wordpro": {
      source: "iana",
      extensions: ["lwp"]
    },
    "application/vnd.macports.portpkg": {
      source: "iana",
      extensions: ["portpkg"]
    },
    "application/vnd.mapbox-vector-tile": {
      source: "iana",
      extensions: ["mvt"]
    },
    "application/vnd.marlin.drm.actiontoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.conftoken+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.license+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.marlin.drm.mdcf": {
      source: "iana"
    },
    "application/vnd.mason+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.maxar.archive.3tz+zip": {
      source: "iana",
      compressible: false
    },
    "application/vnd.maxmind.maxmind-db": {
      source: "iana"
    },
    "application/vnd.mcd": {
      source: "iana",
      extensions: ["mcd"]
    },
    "application/vnd.medcalcdata": {
      source: "iana",
      extensions: ["mc1"]
    },
    "application/vnd.mediastation.cdkey": {
      source: "iana",
      extensions: ["cdkey"]
    },
    "application/vnd.meridian-slingshot": {
      source: "iana"
    },
    "application/vnd.mfer": {
      source: "iana",
      extensions: ["mwf"]
    },
    "application/vnd.mfmp": {
      source: "iana",
      extensions: ["mfm"]
    },
    "application/vnd.micro+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.micrografx.flo": {
      source: "iana",
      extensions: ["flo"]
    },
    "application/vnd.micrografx.igx": {
      source: "iana",
      extensions: ["igx"]
    },
    "application/vnd.microsoft.portable-executable": {
      source: "iana"
    },
    "application/vnd.microsoft.windows.thumbnail-cache": {
      source: "iana"
    },
    "application/vnd.miele+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.mif": {
      source: "iana",
      extensions: ["mif"]
    },
    "application/vnd.minisoft-hp3000-save": {
      source: "iana"
    },
    "application/vnd.mitsubishi.misty-guard.trustweb": {
      source: "iana"
    },
    "application/vnd.mobius.daf": {
      source: "iana",
      extensions: ["daf"]
    },
    "application/vnd.mobius.dis": {
      source: "iana",
      extensions: ["dis"]
    },
    "application/vnd.mobius.mbk": {
      source: "iana",
      extensions: ["mbk"]
    },
    "application/vnd.mobius.mqy": {
      source: "iana",
      extensions: ["mqy"]
    },
    "application/vnd.mobius.msl": {
      source: "iana",
      extensions: ["msl"]
    },
    "application/vnd.mobius.plc": {
      source: "iana",
      extensions: ["plc"]
    },
    "application/vnd.mobius.txf": {
      source: "iana",
      extensions: ["txf"]
    },
    "application/vnd.mophun.application": {
      source: "iana",
      extensions: ["mpn"]
    },
    "application/vnd.mophun.certificate": {
      source: "iana",
      extensions: ["mpc"]
    },
    "application/vnd.motorola.flexsuite": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.adsi": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.fis": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.gotap": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.kmr": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.ttc": {
      source: "iana"
    },
    "application/vnd.motorola.flexsuite.wem": {
      source: "iana"
    },
    "application/vnd.motorola.iprm": {
      source: "iana"
    },
    "application/vnd.mozilla.xul+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xul"]
    },
    "application/vnd.ms-3mfdocument": {
      source: "iana"
    },
    "application/vnd.ms-artgalry": {
      source: "iana",
      extensions: ["cil"]
    },
    "application/vnd.ms-asf": {
      source: "iana"
    },
    "application/vnd.ms-cab-compressed": {
      source: "iana",
      extensions: ["cab"]
    },
    "application/vnd.ms-color.iccprofile": {
      source: "apache"
    },
    "application/vnd.ms-excel": {
      source: "iana",
      compressible: false,
      extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
    },
    "application/vnd.ms-excel.addin.macroenabled.12": {
      source: "iana",
      extensions: ["xlam"]
    },
    "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
      source: "iana",
      extensions: ["xlsb"]
    },
    "application/vnd.ms-excel.sheet.macroenabled.12": {
      source: "iana",
      extensions: ["xlsm"]
    },
    "application/vnd.ms-excel.template.macroenabled.12": {
      source: "iana",
      extensions: ["xltm"]
    },
    "application/vnd.ms-fontobject": {
      source: "iana",
      compressible: true,
      extensions: ["eot"]
    },
    "application/vnd.ms-htmlhelp": {
      source: "iana",
      extensions: ["chm"]
    },
    "application/vnd.ms-ims": {
      source: "iana",
      extensions: ["ims"]
    },
    "application/vnd.ms-lrm": {
      source: "iana",
      extensions: ["lrm"]
    },
    "application/vnd.ms-office.activex+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-officetheme": {
      source: "iana",
      extensions: ["thmx"]
    },
    "application/vnd.ms-opentype": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-outlook": {
      compressible: false,
      extensions: ["msg"]
    },
    "application/vnd.ms-package.obfuscated-opentype": {
      source: "apache"
    },
    "application/vnd.ms-pki.seccat": {
      source: "apache",
      extensions: ["cat"]
    },
    "application/vnd.ms-pki.stl": {
      source: "apache",
      extensions: ["stl"]
    },
    "application/vnd.ms-playready.initiator+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-powerpoint": {
      source: "iana",
      compressible: false,
      extensions: ["ppt", "pps", "pot"]
    },
    "application/vnd.ms-powerpoint.addin.macroenabled.12": {
      source: "iana",
      extensions: ["ppam"]
    },
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
      source: "iana",
      extensions: ["pptm"]
    },
    "application/vnd.ms-powerpoint.slide.macroenabled.12": {
      source: "iana",
      extensions: ["sldm"]
    },
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
      source: "iana",
      extensions: ["ppsm"]
    },
    "application/vnd.ms-powerpoint.template.macroenabled.12": {
      source: "iana",
      extensions: ["potm"]
    },
    "application/vnd.ms-printdevicecapabilities+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-printing.printticket+xml": {
      source: "apache",
      compressible: true
    },
    "application/vnd.ms-printschematicket+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ms-project": {
      source: "iana",
      extensions: ["mpp", "mpt"]
    },
    "application/vnd.ms-tnef": {
      source: "iana"
    },
    "application/vnd.ms-windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.nwprinting.oob": {
      source: "iana"
    },
    "application/vnd.ms-windows.printerpairing": {
      source: "iana"
    },
    "application/vnd.ms-windows.wsd.oob": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.lic-resp": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-chlg-req": {
      source: "iana"
    },
    "application/vnd.ms-wmdrm.meter-resp": {
      source: "iana"
    },
    "application/vnd.ms-word.document.macroenabled.12": {
      source: "iana",
      extensions: ["docm"]
    },
    "application/vnd.ms-word.template.macroenabled.12": {
      source: "iana",
      extensions: ["dotm"]
    },
    "application/vnd.ms-works": {
      source: "iana",
      extensions: ["wps", "wks", "wcm", "wdb"]
    },
    "application/vnd.ms-wpl": {
      source: "iana",
      extensions: ["wpl"]
    },
    "application/vnd.ms-xpsdocument": {
      source: "iana",
      compressible: false,
      extensions: ["xps"]
    },
    "application/vnd.msa-disk-image": {
      source: "iana"
    },
    "application/vnd.mseq": {
      source: "iana",
      extensions: ["mseq"]
    },
    "application/vnd.msign": {
      source: "iana"
    },
    "application/vnd.multiad.creator": {
      source: "iana"
    },
    "application/vnd.multiad.creator.cif": {
      source: "iana"
    },
    "application/vnd.music-niff": {
      source: "iana"
    },
    "application/vnd.musician": {
      source: "iana",
      extensions: ["mus"]
    },
    "application/vnd.muvee.style": {
      source: "iana",
      extensions: ["msty"]
    },
    "application/vnd.mynfc": {
      source: "iana",
      extensions: ["taglet"]
    },
    "application/vnd.nacamar.ybrid+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.ncd.control": {
      source: "iana"
    },
    "application/vnd.ncd.reference": {
      source: "iana"
    },
    "application/vnd.nearst.inv+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nebumind.line": {
      source: "iana"
    },
    "application/vnd.nervana": {
      source: "iana"
    },
    "application/vnd.netfpx": {
      source: "iana"
    },
    "application/vnd.neurolanguage.nlu": {
      source: "iana",
      extensions: ["nlu"]
    },
    "application/vnd.nimn": {
      source: "iana"
    },
    "application/vnd.nintendo.nitro.rom": {
      source: "iana"
    },
    "application/vnd.nintendo.snes.rom": {
      source: "iana"
    },
    "application/vnd.nitf": {
      source: "iana",
      extensions: ["ntf", "nitf"]
    },
    "application/vnd.noblenet-directory": {
      source: "iana",
      extensions: ["nnd"]
    },
    "application/vnd.noblenet-sealer": {
      source: "iana",
      extensions: ["nns"]
    },
    "application/vnd.noblenet-web": {
      source: "iana",
      extensions: ["nnw"]
    },
    "application/vnd.nokia.catalogs": {
      source: "iana"
    },
    "application/vnd.nokia.conml+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.conml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.iptv.config+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.isds-radio-presets": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.landmark+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.landmarkcollection+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.n-gage.ac+xml": {
      source: "iana",
      compressible: true,
      extensions: ["ac"]
    },
    "application/vnd.nokia.n-gage.data": {
      source: "iana",
      extensions: ["ngdat"]
    },
    "application/vnd.nokia.n-gage.symbian.install": {
      source: "iana",
      extensions: ["n-gage"]
    },
    "application/vnd.nokia.ncd": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+wbxml": {
      source: "iana"
    },
    "application/vnd.nokia.pcd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.nokia.radio-preset": {
      source: "iana",
      extensions: ["rpst"]
    },
    "application/vnd.nokia.radio-presets": {
      source: "iana",
      extensions: ["rpss"]
    },
    "application/vnd.novadigm.edm": {
      source: "iana",
      extensions: ["edm"]
    },
    "application/vnd.novadigm.edx": {
      source: "iana",
      extensions: ["edx"]
    },
    "application/vnd.novadigm.ext": {
      source: "iana",
      extensions: ["ext"]
    },
    "application/vnd.ntt-local.content-share": {
      source: "iana"
    },
    "application/vnd.ntt-local.file-transfer": {
      source: "iana"
    },
    "application/vnd.ntt-local.ogw_remote-access": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_remote": {
      source: "iana"
    },
    "application/vnd.ntt-local.sip-ta_tcp_stream": {
      source: "iana"
    },
    "application/vnd.oasis.opendocument.chart": {
      source: "iana",
      extensions: ["odc"]
    },
    "application/vnd.oasis.opendocument.chart-template": {
      source: "iana",
      extensions: ["otc"]
    },
    "application/vnd.oasis.opendocument.database": {
      source: "iana",
      extensions: ["odb"]
    },
    "application/vnd.oasis.opendocument.formula": {
      source: "iana",
      extensions: ["odf"]
    },
    "application/vnd.oasis.opendocument.formula-template": {
      source: "iana",
      extensions: ["odft"]
    },
    "application/vnd.oasis.opendocument.graphics": {
      source: "iana",
      compressible: false,
      extensions: ["odg"]
    },
    "application/vnd.oasis.opendocument.graphics-template": {
      source: "iana",
      extensions: ["otg"]
    },
    "application/vnd.oasis.opendocument.image": {
      source: "iana",
      extensions: ["odi"]
    },
    "application/vnd.oasis.opendocument.image-template": {
      source: "iana",
      extensions: ["oti"]
    },
    "application/vnd.oasis.opendocument.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["odp"]
    },
    "application/vnd.oasis.opendocument.presentation-template": {
      source: "iana",
      extensions: ["otp"]
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      source: "iana",
      compressible: false,
      extensions: ["ods"]
    },
    "application/vnd.oasis.opendocument.spreadsheet-template": {
      source: "iana",
      extensions: ["ots"]
    },
    "application/vnd.oasis.opendocument.text": {
      source: "iana",
      compressible: false,
      extensions: ["odt"]
    },
    "application/vnd.oasis.opendocument.text-master": {
      source: "iana",
      extensions: ["odm"]
    },
    "application/vnd.oasis.opendocument.text-template": {
      source: "iana",
      extensions: ["ott"]
    },
    "application/vnd.oasis.opendocument.text-web": {
      source: "iana",
      extensions: ["oth"]
    },
    "application/vnd.obn": {
      source: "iana"
    },
    "application/vnd.ocf+cbor": {
      source: "iana"
    },
    "application/vnd.oci.image.manifest.v1+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oftn.l10n+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessdownload+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.contentaccessstreaming+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.cspg-hexbinary": {
      source: "iana"
    },
    "application/vnd.oipf.dae.svg+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.dae.xhtml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.mippvcontrolmessage+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.pae.gem": {
      source: "iana"
    },
    "application/vnd.oipf.spdiscovery+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.spdlist+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.ueprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oipf.userprofile+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.olpc-sugar": {
      source: "iana",
      extensions: ["xo"]
    },
    "application/vnd.oma-scws-config": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-request": {
      source: "iana"
    },
    "application/vnd.oma-scws-http-response": {
      source: "iana"
    },
    "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.drm-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.imd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.ltkm": {
      source: "iana"
    },
    "application/vnd.oma.bcast.notification+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.provisioningtrigger": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgboot": {
      source: "iana"
    },
    "application/vnd.oma.bcast.sgdd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sgdu": {
      source: "iana"
    },
    "application/vnd.oma.bcast.simple-symbol-container": {
      source: "iana"
    },
    "application/vnd.oma.bcast.smartcard-trigger+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.sprov+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.bcast.stkm": {
      source: "iana"
    },
    "application/vnd.oma.cab-address-book+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-feature-handler+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-pcc+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-subs-invite+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.cab-user-prefs+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.dcd": {
      source: "iana"
    },
    "application/vnd.oma.dcdc": {
      source: "iana"
    },
    "application/vnd.oma.dd2+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dd2"]
    },
    "application/vnd.oma.drm.risd+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.group-usage-list+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+cbor": {
      source: "iana"
    },
    "application/vnd.oma.lwm2m+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.lwm2m+tlv": {
      source: "iana"
    },
    "application/vnd.oma.pal+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.detailed-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.final-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.groups+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.invocation-descriptor+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.poc.optimized-progress-report+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.push": {
      source: "iana"
    },
    "application/vnd.oma.scidm.messages+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oma.xcap-directory+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.omads-email+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-file+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omads-folder+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.omaloc-supl-init": {
      source: "iana"
    },
    "application/vnd.onepager": {
      source: "iana"
    },
    "application/vnd.onepagertamp": {
      source: "iana"
    },
    "application/vnd.onepagertamx": {
      source: "iana"
    },
    "application/vnd.onepagertat": {
      source: "iana"
    },
    "application/vnd.onepagertatp": {
      source: "iana"
    },
    "application/vnd.onepagertatx": {
      source: "iana"
    },
    "application/vnd.openblox.game+xml": {
      source: "iana",
      compressible: true,
      extensions: ["obgx"]
    },
    "application/vnd.openblox.game-binary": {
      source: "iana"
    },
    "application/vnd.openeye.oeb": {
      source: "iana"
    },
    "application/vnd.openofficeorg.extension": {
      source: "apache",
      extensions: ["oxt"]
    },
    "application/vnd.openstreetmap.data+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osm"]
    },
    "application/vnd.opentimestamps.ots": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawing+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      source: "iana",
      compressible: false,
      extensions: ["pptx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide": {
      source: "iana",
      extensions: ["sldx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
      source: "iana",
      extensions: ["ppsx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template": {
      source: "iana",
      extensions: ["potx"]
    },
    "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      source: "iana",
      compressible: false,
      extensions: ["xlsx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
      source: "iana",
      extensions: ["xltx"]
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.theme+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.vmldrawing": {
      source: "iana"
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      source: "iana",
      compressible: false,
      extensions: ["docx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
      source: "iana",
      extensions: ["dotx"]
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.core-properties+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.openxmlformats-package.relationships+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oracle.resource+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.orange.indata": {
      source: "iana"
    },
    "application/vnd.osa.netdeploy": {
      source: "iana"
    },
    "application/vnd.osgeo.mapguide.package": {
      source: "iana",
      extensions: ["mgp"]
    },
    "application/vnd.osgi.bundle": {
      source: "iana"
    },
    "application/vnd.osgi.dp": {
      source: "iana",
      extensions: ["dp"]
    },
    "application/vnd.osgi.subsystem": {
      source: "iana",
      extensions: ["esa"]
    },
    "application/vnd.otps.ct-kip+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.oxli.countgraph": {
      source: "iana"
    },
    "application/vnd.pagerduty+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.palm": {
      source: "iana",
      extensions: ["pdb", "pqa", "oprc"]
    },
    "application/vnd.panoply": {
      source: "iana"
    },
    "application/vnd.paos.xml": {
      source: "iana"
    },
    "application/vnd.patentdive": {
      source: "iana"
    },
    "application/vnd.patientecommsdoc": {
      source: "iana"
    },
    "application/vnd.pawaafile": {
      source: "iana",
      extensions: ["paw"]
    },
    "application/vnd.pcos": {
      source: "iana"
    },
    "application/vnd.pg.format": {
      source: "iana",
      extensions: ["str"]
    },
    "application/vnd.pg.osasli": {
      source: "iana",
      extensions: ["ei6"]
    },
    "application/vnd.piaccess.application-licence": {
      source: "iana"
    },
    "application/vnd.picsel": {
      source: "iana",
      extensions: ["efif"]
    },
    "application/vnd.pmi.widget": {
      source: "iana",
      extensions: ["wg"]
    },
    "application/vnd.poc.group-advertisement+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.pocketlearn": {
      source: "iana",
      extensions: ["plf"]
    },
    "application/vnd.powerbuilder6": {
      source: "iana",
      extensions: ["pbd"]
    },
    "application/vnd.powerbuilder6-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder7": {
      source: "iana"
    },
    "application/vnd.powerbuilder7-s": {
      source: "iana"
    },
    "application/vnd.powerbuilder75": {
      source: "iana"
    },
    "application/vnd.powerbuilder75-s": {
      source: "iana"
    },
    "application/vnd.preminet": {
      source: "iana"
    },
    "application/vnd.previewsystems.box": {
      source: "iana",
      extensions: ["box"]
    },
    "application/vnd.proteus.magazine": {
      source: "iana",
      extensions: ["mgz"]
    },
    "application/vnd.psfs": {
      source: "iana"
    },
    "application/vnd.publishare-delta-tree": {
      source: "iana",
      extensions: ["qps"]
    },
    "application/vnd.pvi.ptid1": {
      source: "iana",
      extensions: ["ptid"]
    },
    "application/vnd.pwg-multiplexed": {
      source: "iana"
    },
    "application/vnd.pwg-xhtml-print+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.qualcomm.brew-app-res": {
      source: "iana"
    },
    "application/vnd.quarantainenet": {
      source: "iana"
    },
    "application/vnd.quark.quarkxpress": {
      source: "iana",
      extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
    },
    "application/vnd.quobject-quoxdocument": {
      source: "iana"
    },
    "application/vnd.radisys.moml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-conn+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-audit-stream+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-conf+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-base+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-detect+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-group+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-speech+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.radisys.msml-dialog-transform+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rainstor.data": {
      source: "iana"
    },
    "application/vnd.rapid": {
      source: "iana"
    },
    "application/vnd.rar": {
      source: "iana",
      extensions: ["rar"]
    },
    "application/vnd.realvnc.bed": {
      source: "iana",
      extensions: ["bed"]
    },
    "application/vnd.recordare.musicxml": {
      source: "iana",
      extensions: ["mxl"]
    },
    "application/vnd.recordare.musicxml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["musicxml"]
    },
    "application/vnd.renlearn.rlprint": {
      source: "iana"
    },
    "application/vnd.resilient.logic": {
      source: "iana"
    },
    "application/vnd.restful+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.rig.cryptonote": {
      source: "iana",
      extensions: ["cryptonote"]
    },
    "application/vnd.rim.cod": {
      source: "apache",
      extensions: ["cod"]
    },
    "application/vnd.rn-realmedia": {
      source: "apache",
      extensions: ["rm"]
    },
    "application/vnd.rn-realmedia-vbr": {
      source: "apache",
      extensions: ["rmvb"]
    },
    "application/vnd.route66.link66+xml": {
      source: "iana",
      compressible: true,
      extensions: ["link66"]
    },
    "application/vnd.rs-274x": {
      source: "iana"
    },
    "application/vnd.ruckus.download": {
      source: "iana"
    },
    "application/vnd.s3sms": {
      source: "iana"
    },
    "application/vnd.sailingtracker.track": {
      source: "iana",
      extensions: ["st"]
    },
    "application/vnd.sar": {
      source: "iana"
    },
    "application/vnd.sbm.cid": {
      source: "iana"
    },
    "application/vnd.sbm.mid2": {
      source: "iana"
    },
    "application/vnd.scribus": {
      source: "iana"
    },
    "application/vnd.sealed.3df": {
      source: "iana"
    },
    "application/vnd.sealed.csf": {
      source: "iana"
    },
    "application/vnd.sealed.doc": {
      source: "iana"
    },
    "application/vnd.sealed.eml": {
      source: "iana"
    },
    "application/vnd.sealed.mht": {
      source: "iana"
    },
    "application/vnd.sealed.net": {
      source: "iana"
    },
    "application/vnd.sealed.ppt": {
      source: "iana"
    },
    "application/vnd.sealed.tiff": {
      source: "iana"
    },
    "application/vnd.sealed.xls": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.html": {
      source: "iana"
    },
    "application/vnd.sealedmedia.softseal.pdf": {
      source: "iana"
    },
    "application/vnd.seemail": {
      source: "iana",
      extensions: ["see"]
    },
    "application/vnd.seis+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.sema": {
      source: "iana",
      extensions: ["sema"]
    },
    "application/vnd.semd": {
      source: "iana",
      extensions: ["semd"]
    },
    "application/vnd.semf": {
      source: "iana",
      extensions: ["semf"]
    },
    "application/vnd.shade-save-file": {
      source: "iana"
    },
    "application/vnd.shana.informed.formdata": {
      source: "iana",
      extensions: ["ifm"]
    },
    "application/vnd.shana.informed.formtemplate": {
      source: "iana",
      extensions: ["itp"]
    },
    "application/vnd.shana.informed.interchange": {
      source: "iana",
      extensions: ["iif"]
    },
    "application/vnd.shana.informed.package": {
      source: "iana",
      extensions: ["ipk"]
    },
    "application/vnd.shootproof+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shopkick+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.shp": {
      source: "iana"
    },
    "application/vnd.shx": {
      source: "iana"
    },
    "application/vnd.sigrok.session": {
      source: "iana"
    },
    "application/vnd.simtech-mindmapper": {
      source: "iana",
      extensions: ["twd", "twds"]
    },
    "application/vnd.siren+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.smaf": {
      source: "iana",
      extensions: ["mmf"]
    },
    "application/vnd.smart.notebook": {
      source: "iana"
    },
    "application/vnd.smart.teacher": {
      source: "iana",
      extensions: ["teacher"]
    },
    "application/vnd.snesdev-page-table": {
      source: "iana"
    },
    "application/vnd.software602.filler.form+xml": {
      source: "iana",
      compressible: true,
      extensions: ["fo"]
    },
    "application/vnd.software602.filler.form-xml-zip": {
      source: "iana"
    },
    "application/vnd.solent.sdkm+xml": {
      source: "iana",
      compressible: true,
      extensions: ["sdkm", "sdkd"]
    },
    "application/vnd.spotfire.dxp": {
      source: "iana",
      extensions: ["dxp"]
    },
    "application/vnd.spotfire.sfs": {
      source: "iana",
      extensions: ["sfs"]
    },
    "application/vnd.sqlite3": {
      source: "iana"
    },
    "application/vnd.sss-cod": {
      source: "iana"
    },
    "application/vnd.sss-dtf": {
      source: "iana"
    },
    "application/vnd.sss-ntf": {
      source: "iana"
    },
    "application/vnd.stardivision.calc": {
      source: "apache",
      extensions: ["sdc"]
    },
    "application/vnd.stardivision.draw": {
      source: "apache",
      extensions: ["sda"]
    },
    "application/vnd.stardivision.impress": {
      source: "apache",
      extensions: ["sdd"]
    },
    "application/vnd.stardivision.math": {
      source: "apache",
      extensions: ["smf"]
    },
    "application/vnd.stardivision.writer": {
      source: "apache",
      extensions: ["sdw", "vor"]
    },
    "application/vnd.stardivision.writer-global": {
      source: "apache",
      extensions: ["sgl"]
    },
    "application/vnd.stepmania.package": {
      source: "iana",
      extensions: ["smzip"]
    },
    "application/vnd.stepmania.stepchart": {
      source: "iana",
      extensions: ["sm"]
    },
    "application/vnd.street-stream": {
      source: "iana"
    },
    "application/vnd.sun.wadl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wadl"]
    },
    "application/vnd.sun.xml.calc": {
      source: "apache",
      extensions: ["sxc"]
    },
    "application/vnd.sun.xml.calc.template": {
      source: "apache",
      extensions: ["stc"]
    },
    "application/vnd.sun.xml.draw": {
      source: "apache",
      extensions: ["sxd"]
    },
    "application/vnd.sun.xml.draw.template": {
      source: "apache",
      extensions: ["std"]
    },
    "application/vnd.sun.xml.impress": {
      source: "apache",
      extensions: ["sxi"]
    },
    "application/vnd.sun.xml.impress.template": {
      source: "apache",
      extensions: ["sti"]
    },
    "application/vnd.sun.xml.math": {
      source: "apache",
      extensions: ["sxm"]
    },
    "application/vnd.sun.xml.writer": {
      source: "apache",
      extensions: ["sxw"]
    },
    "application/vnd.sun.xml.writer.global": {
      source: "apache",
      extensions: ["sxg"]
    },
    "application/vnd.sun.xml.writer.template": {
      source: "apache",
      extensions: ["stw"]
    },
    "application/vnd.sus-calendar": {
      source: "iana",
      extensions: ["sus", "susp"]
    },
    "application/vnd.svd": {
      source: "iana",
      extensions: ["svd"]
    },
    "application/vnd.swiftview-ics": {
      source: "iana"
    },
    "application/vnd.sycle+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.syft+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.symbian.install": {
      source: "apache",
      extensions: ["sis", "sisx"]
    },
    "application/vnd.syncml+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xsm"]
    },
    "application/vnd.syncml.dm+wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["bdm"]
    },
    "application/vnd.syncml.dm+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["xdm"]
    },
    "application/vnd.syncml.dm.notification": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmddf+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["ddf"]
    },
    "application/vnd.syncml.dmtnds+wbxml": {
      source: "iana"
    },
    "application/vnd.syncml.dmtnds+xml": {
      source: "iana",
      charset: "UTF-8",
      compressible: true
    },
    "application/vnd.syncml.ds.notification": {
      source: "iana"
    },
    "application/vnd.tableschema+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tao.intent-module-archive": {
      source: "iana",
      extensions: ["tao"]
    },
    "application/vnd.tcpdump.pcap": {
      source: "iana",
      extensions: ["pcap", "cap", "dmp"]
    },
    "application/vnd.think-cell.ppttc+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tmd.mediaflex.api+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.tml": {
      source: "iana"
    },
    "application/vnd.tmobile-livetv": {
      source: "iana",
      extensions: ["tmo"]
    },
    "application/vnd.tri.onesource": {
      source: "iana"
    },
    "application/vnd.trid.tpt": {
      source: "iana",
      extensions: ["tpt"]
    },
    "application/vnd.triscape.mxs": {
      source: "iana",
      extensions: ["mxs"]
    },
    "application/vnd.trueapp": {
      source: "iana",
      extensions: ["tra"]
    },
    "application/vnd.truedoc": {
      source: "iana"
    },
    "application/vnd.ubisoft.webplayer": {
      source: "iana"
    },
    "application/vnd.ufdl": {
      source: "iana",
      extensions: ["ufd", "ufdl"]
    },
    "application/vnd.uiq.theme": {
      source: "iana",
      extensions: ["utz"]
    },
    "application/vnd.umajin": {
      source: "iana",
      extensions: ["umj"]
    },
    "application/vnd.unity": {
      source: "iana",
      extensions: ["unityweb"]
    },
    "application/vnd.uoml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["uoml"]
    },
    "application/vnd.uplanet.alert": {
      source: "iana"
    },
    "application/vnd.uplanet.alert-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice": {
      source: "iana"
    },
    "application/vnd.uplanet.bearer-choice-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop": {
      source: "iana"
    },
    "application/vnd.uplanet.cacheop-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.channel": {
      source: "iana"
    },
    "application/vnd.uplanet.channel-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.list": {
      source: "iana"
    },
    "application/vnd.uplanet.list-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd": {
      source: "iana"
    },
    "application/vnd.uplanet.listcmd-wbxml": {
      source: "iana"
    },
    "application/vnd.uplanet.signal": {
      source: "iana"
    },
    "application/vnd.uri-map": {
      source: "iana"
    },
    "application/vnd.valve.source.material": {
      source: "iana"
    },
    "application/vnd.vcx": {
      source: "iana",
      extensions: ["vcx"]
    },
    "application/vnd.vd-study": {
      source: "iana"
    },
    "application/vnd.vectorworks": {
      source: "iana"
    },
    "application/vnd.vel+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.verimatrix.vcas": {
      source: "iana"
    },
    "application/vnd.veritone.aion+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.veryant.thin": {
      source: "iana"
    },
    "application/vnd.ves.encrypted": {
      source: "iana"
    },
    "application/vnd.vidsoft.vidconference": {
      source: "iana"
    },
    "application/vnd.visio": {
      source: "iana",
      extensions: ["vsd", "vst", "vss", "vsw"]
    },
    "application/vnd.visionary": {
      source: "iana",
      extensions: ["vis"]
    },
    "application/vnd.vividence.scriptfile": {
      source: "iana"
    },
    "application/vnd.vsf": {
      source: "iana",
      extensions: ["vsf"]
    },
    "application/vnd.wap.sic": {
      source: "iana"
    },
    "application/vnd.wap.slc": {
      source: "iana"
    },
    "application/vnd.wap.wbxml": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["wbxml"]
    },
    "application/vnd.wap.wmlc": {
      source: "iana",
      extensions: ["wmlc"]
    },
    "application/vnd.wap.wmlscriptc": {
      source: "iana",
      extensions: ["wmlsc"]
    },
    "application/vnd.webturbo": {
      source: "iana",
      extensions: ["wtb"]
    },
    "application/vnd.wfa.dpp": {
      source: "iana"
    },
    "application/vnd.wfa.p2p": {
      source: "iana"
    },
    "application/vnd.wfa.wsc": {
      source: "iana"
    },
    "application/vnd.windows.devicepairing": {
      source: "iana"
    },
    "application/vnd.wmc": {
      source: "iana"
    },
    "application/vnd.wmf.bootstrap": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica": {
      source: "iana"
    },
    "application/vnd.wolfram.mathematica.package": {
      source: "iana"
    },
    "application/vnd.wolfram.player": {
      source: "iana",
      extensions: ["nbp"]
    },
    "application/vnd.wordperfect": {
      source: "iana",
      extensions: ["wpd"]
    },
    "application/vnd.wqd": {
      source: "iana",
      extensions: ["wqd"]
    },
    "application/vnd.wrq-hp3000-labelled": {
      source: "iana"
    },
    "application/vnd.wt.stf": {
      source: "iana",
      extensions: ["stf"]
    },
    "application/vnd.wv.csp+wbxml": {
      source: "iana"
    },
    "application/vnd.wv.csp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.wv.ssp+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xacml+json": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xara": {
      source: "iana",
      extensions: ["xar"]
    },
    "application/vnd.xfdl": {
      source: "iana",
      extensions: ["xfdl"]
    },
    "application/vnd.xfdl.webform": {
      source: "iana"
    },
    "application/vnd.xmi+xml": {
      source: "iana",
      compressible: true
    },
    "application/vnd.xmpie.cpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.dpkg": {
      source: "iana"
    },
    "application/vnd.xmpie.plan": {
      source: "iana"
    },
    "application/vnd.xmpie.ppkg": {
      source: "iana"
    },
    "application/vnd.xmpie.xlim": {
      source: "iana"
    },
    "application/vnd.yamaha.hv-dic": {
      source: "iana",
      extensions: ["hvd"]
    },
    "application/vnd.yamaha.hv-script": {
      source: "iana",
      extensions: ["hvs"]
    },
    "application/vnd.yamaha.hv-voice": {
      source: "iana",
      extensions: ["hvp"]
    },
    "application/vnd.yamaha.openscoreformat": {
      source: "iana",
      extensions: ["osf"]
    },
    "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["osfpvg"]
    },
    "application/vnd.yamaha.remote-setup": {
      source: "iana"
    },
    "application/vnd.yamaha.smaf-audio": {
      source: "iana",
      extensions: ["saf"]
    },
    "application/vnd.yamaha.smaf-phrase": {
      source: "iana",
      extensions: ["spf"]
    },
    "application/vnd.yamaha.through-ngn": {
      source: "iana"
    },
    "application/vnd.yamaha.tunnel-udpencap": {
      source: "iana"
    },
    "application/vnd.yaoweme": {
      source: "iana"
    },
    "application/vnd.yellowriver-custom-menu": {
      source: "iana",
      extensions: ["cmp"]
    },
    "application/vnd.youtube.yt": {
      source: "iana"
    },
    "application/vnd.zul": {
      source: "iana",
      extensions: ["zir", "zirz"]
    },
    "application/vnd.zzazz.deck+xml": {
      source: "iana",
      compressible: true,
      extensions: ["zaz"]
    },
    "application/voicexml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["vxml"]
    },
    "application/voucher-cms+json": {
      source: "iana",
      compressible: true
    },
    "application/vq-rtcpxr": {
      source: "iana"
    },
    "application/wasm": {
      source: "iana",
      compressible: true,
      extensions: ["wasm"]
    },
    "application/watcherinfo+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wif"]
    },
    "application/webpush-options+json": {
      source: "iana",
      compressible: true
    },
    "application/whoispp-query": {
      source: "iana"
    },
    "application/whoispp-response": {
      source: "iana"
    },
    "application/widget": {
      source: "iana",
      extensions: ["wgt"]
    },
    "application/winhlp": {
      source: "apache",
      extensions: ["hlp"]
    },
    "application/wita": {
      source: "iana"
    },
    "application/wordperfect5.1": {
      source: "iana"
    },
    "application/wsdl+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wsdl"]
    },
    "application/wspolicy+xml": {
      source: "iana",
      compressible: true,
      extensions: ["wspolicy"]
    },
    "application/x-7z-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["7z"]
    },
    "application/x-abiword": {
      source: "apache",
      extensions: ["abw"]
    },
    "application/x-ace-compressed": {
      source: "apache",
      extensions: ["ace"]
    },
    "application/x-amf": {
      source: "apache"
    },
    "application/x-apple-diskimage": {
      source: "apache",
      extensions: ["dmg"]
    },
    "application/x-arj": {
      compressible: false,
      extensions: ["arj"]
    },
    "application/x-authorware-bin": {
      source: "apache",
      extensions: ["aab", "x32", "u32", "vox"]
    },
    "application/x-authorware-map": {
      source: "apache",
      extensions: ["aam"]
    },
    "application/x-authorware-seg": {
      source: "apache",
      extensions: ["aas"]
    },
    "application/x-bcpio": {
      source: "apache",
      extensions: ["bcpio"]
    },
    "application/x-bdoc": {
      compressible: false,
      extensions: ["bdoc"]
    },
    "application/x-bittorrent": {
      source: "apache",
      extensions: ["torrent"]
    },
    "application/x-blorb": {
      source: "apache",
      extensions: ["blb", "blorb"]
    },
    "application/x-bzip": {
      source: "apache",
      compressible: false,
      extensions: ["bz"]
    },
    "application/x-bzip2": {
      source: "apache",
      compressible: false,
      extensions: ["bz2", "boz"]
    },
    "application/x-cbr": {
      source: "apache",
      extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
    },
    "application/x-cdlink": {
      source: "apache",
      extensions: ["vcd"]
    },
    "application/x-cfs-compressed": {
      source: "apache",
      extensions: ["cfs"]
    },
    "application/x-chat": {
      source: "apache",
      extensions: ["chat"]
    },
    "application/x-chess-pgn": {
      source: "apache",
      extensions: ["pgn"]
    },
    "application/x-chrome-extension": {
      extensions: ["crx"]
    },
    "application/x-cocoa": {
      source: "nginx",
      extensions: ["cco"]
    },
    "application/x-compress": {
      source: "apache"
    },
    "application/x-conference": {
      source: "apache",
      extensions: ["nsc"]
    },
    "application/x-cpio": {
      source: "apache",
      extensions: ["cpio"]
    },
    "application/x-csh": {
      source: "apache",
      extensions: ["csh"]
    },
    "application/x-deb": {
      compressible: false
    },
    "application/x-debian-package": {
      source: "apache",
      extensions: ["deb", "udeb"]
    },
    "application/x-dgc-compressed": {
      source: "apache",
      extensions: ["dgc"]
    },
    "application/x-director": {
      source: "apache",
      extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
    },
    "application/x-doom": {
      source: "apache",
      extensions: ["wad"]
    },
    "application/x-dtbncx+xml": {
      source: "apache",
      compressible: true,
      extensions: ["ncx"]
    },
    "application/x-dtbook+xml": {
      source: "apache",
      compressible: true,
      extensions: ["dtb"]
    },
    "application/x-dtbresource+xml": {
      source: "apache",
      compressible: true,
      extensions: ["res"]
    },
    "application/x-dvi": {
      source: "apache",
      compressible: false,
      extensions: ["dvi"]
    },
    "application/x-envoy": {
      source: "apache",
      extensions: ["evy"]
    },
    "application/x-eva": {
      source: "apache",
      extensions: ["eva"]
    },
    "application/x-font-bdf": {
      source: "apache",
      extensions: ["bdf"]
    },
    "application/x-font-dos": {
      source: "apache"
    },
    "application/x-font-framemaker": {
      source: "apache"
    },
    "application/x-font-ghostscript": {
      source: "apache",
      extensions: ["gsf"]
    },
    "application/x-font-libgrx": {
      source: "apache"
    },
    "application/x-font-linux-psf": {
      source: "apache",
      extensions: ["psf"]
    },
    "application/x-font-pcf": {
      source: "apache",
      extensions: ["pcf"]
    },
    "application/x-font-snf": {
      source: "apache",
      extensions: ["snf"]
    },
    "application/x-font-speedo": {
      source: "apache"
    },
    "application/x-font-sunos-news": {
      source: "apache"
    },
    "application/x-font-type1": {
      source: "apache",
      extensions: ["pfa", "pfb", "pfm", "afm"]
    },
    "application/x-font-vfont": {
      source: "apache"
    },
    "application/x-freearc": {
      source: "apache",
      extensions: ["arc"]
    },
    "application/x-futuresplash": {
      source: "apache",
      extensions: ["spl"]
    },
    "application/x-gca-compressed": {
      source: "apache",
      extensions: ["gca"]
    },
    "application/x-glulx": {
      source: "apache",
      extensions: ["ulx"]
    },
    "application/x-gnumeric": {
      source: "apache",
      extensions: ["gnumeric"]
    },
    "application/x-gramps-xml": {
      source: "apache",
      extensions: ["gramps"]
    },
    "application/x-gtar": {
      source: "apache",
      extensions: ["gtar"]
    },
    "application/x-gzip": {
      source: "apache"
    },
    "application/x-hdf": {
      source: "apache",
      extensions: ["hdf"]
    },
    "application/x-httpd-php": {
      compressible: true,
      extensions: ["php"]
    },
    "application/x-install-instructions": {
      source: "apache",
      extensions: ["install"]
    },
    "application/x-iso9660-image": {
      source: "apache",
      extensions: ["iso"]
    },
    "application/x-iwork-keynote-sffkey": {
      extensions: ["key"]
    },
    "application/x-iwork-numbers-sffnumbers": {
      extensions: ["numbers"]
    },
    "application/x-iwork-pages-sffpages": {
      extensions: ["pages"]
    },
    "application/x-java-archive-diff": {
      source: "nginx",
      extensions: ["jardiff"]
    },
    "application/x-java-jnlp-file": {
      source: "apache",
      compressible: false,
      extensions: ["jnlp"]
    },
    "application/x-javascript": {
      compressible: true
    },
    "application/x-keepass2": {
      extensions: ["kdbx"]
    },
    "application/x-latex": {
      source: "apache",
      compressible: false,
      extensions: ["latex"]
    },
    "application/x-lua-bytecode": {
      extensions: ["luac"]
    },
    "application/x-lzh-compressed": {
      source: "apache",
      extensions: ["lzh", "lha"]
    },
    "application/x-makeself": {
      source: "nginx",
      extensions: ["run"]
    },
    "application/x-mie": {
      source: "apache",
      extensions: ["mie"]
    },
    "application/x-mobipocket-ebook": {
      source: "apache",
      extensions: ["prc", "mobi"]
    },
    "application/x-mpegurl": {
      compressible: false
    },
    "application/x-ms-application": {
      source: "apache",
      extensions: ["application"]
    },
    "application/x-ms-shortcut": {
      source: "apache",
      extensions: ["lnk"]
    },
    "application/x-ms-wmd": {
      source: "apache",
      extensions: ["wmd"]
    },
    "application/x-ms-wmz": {
      source: "apache",
      extensions: ["wmz"]
    },
    "application/x-ms-xbap": {
      source: "apache",
      extensions: ["xbap"]
    },
    "application/x-msaccess": {
      source: "apache",
      extensions: ["mdb"]
    },
    "application/x-msbinder": {
      source: "apache",
      extensions: ["obd"]
    },
    "application/x-mscardfile": {
      source: "apache",
      extensions: ["crd"]
    },
    "application/x-msclip": {
      source: "apache",
      extensions: ["clp"]
    },
    "application/x-msdos-program": {
      extensions: ["exe"]
    },
    "application/x-msdownload": {
      source: "apache",
      extensions: ["exe", "dll", "com", "bat", "msi"]
    },
    "application/x-msmediaview": {
      source: "apache",
      extensions: ["mvb", "m13", "m14"]
    },
    "application/x-msmetafile": {
      source: "apache",
      extensions: ["wmf", "wmz", "emf", "emz"]
    },
    "application/x-msmoney": {
      source: "apache",
      extensions: ["mny"]
    },
    "application/x-mspublisher": {
      source: "apache",
      extensions: ["pub"]
    },
    "application/x-msschedule": {
      source: "apache",
      extensions: ["scd"]
    },
    "application/x-msterminal": {
      source: "apache",
      extensions: ["trm"]
    },
    "application/x-mswrite": {
      source: "apache",
      extensions: ["wri"]
    },
    "application/x-netcdf": {
      source: "apache",
      extensions: ["nc", "cdf"]
    },
    "application/x-ns-proxy-autoconfig": {
      compressible: true,
      extensions: ["pac"]
    },
    "application/x-nzb": {
      source: "apache",
      extensions: ["nzb"]
    },
    "application/x-perl": {
      source: "nginx",
      extensions: ["pl", "pm"]
    },
    "application/x-pilot": {
      source: "nginx",
      extensions: ["prc", "pdb"]
    },
    "application/x-pkcs12": {
      source: "apache",
      compressible: false,
      extensions: ["p12", "pfx"]
    },
    "application/x-pkcs7-certificates": {
      source: "apache",
      extensions: ["p7b", "spc"]
    },
    "application/x-pkcs7-certreqresp": {
      source: "apache",
      extensions: ["p7r"]
    },
    "application/x-pki-message": {
      source: "iana"
    },
    "application/x-rar-compressed": {
      source: "apache",
      compressible: false,
      extensions: ["rar"]
    },
    "application/x-redhat-package-manager": {
      source: "nginx",
      extensions: ["rpm"]
    },
    "application/x-research-info-systems": {
      source: "apache",
      extensions: ["ris"]
    },
    "application/x-sea": {
      source: "nginx",
      extensions: ["sea"]
    },
    "application/x-sh": {
      source: "apache",
      compressible: true,
      extensions: ["sh"]
    },
    "application/x-shar": {
      source: "apache",
      extensions: ["shar"]
    },
    "application/x-shockwave-flash": {
      source: "apache",
      compressible: false,
      extensions: ["swf"]
    },
    "application/x-silverlight-app": {
      source: "apache",
      extensions: ["xap"]
    },
    "application/x-sql": {
      source: "apache",
      extensions: ["sql"]
    },
    "application/x-stuffit": {
      source: "apache",
      compressible: false,
      extensions: ["sit"]
    },
    "application/x-stuffitx": {
      source: "apache",
      extensions: ["sitx"]
    },
    "application/x-subrip": {
      source: "apache",
      extensions: ["srt"]
    },
    "application/x-sv4cpio": {
      source: "apache",
      extensions: ["sv4cpio"]
    },
    "application/x-sv4crc": {
      source: "apache",
      extensions: ["sv4crc"]
    },
    "application/x-t3vm-image": {
      source: "apache",
      extensions: ["t3"]
    },
    "application/x-tads": {
      source: "apache",
      extensions: ["gam"]
    },
    "application/x-tar": {
      source: "apache",
      compressible: true,
      extensions: ["tar"]
    },
    "application/x-tcl": {
      source: "apache",
      extensions: ["tcl", "tk"]
    },
    "application/x-tex": {
      source: "apache",
      extensions: ["tex"]
    },
    "application/x-tex-tfm": {
      source: "apache",
      extensions: ["tfm"]
    },
    "application/x-texinfo": {
      source: "apache",
      extensions: ["texinfo", "texi"]
    },
    "application/x-tgif": {
      source: "apache",
      extensions: ["obj"]
    },
    "application/x-ustar": {
      source: "apache",
      extensions: ["ustar"]
    },
    "application/x-virtualbox-hdd": {
      compressible: true,
      extensions: ["hdd"]
    },
    "application/x-virtualbox-ova": {
      compressible: true,
      extensions: ["ova"]
    },
    "application/x-virtualbox-ovf": {
      compressible: true,
      extensions: ["ovf"]
    },
    "application/x-virtualbox-vbox": {
      compressible: true,
      extensions: ["vbox"]
    },
    "application/x-virtualbox-vbox-extpack": {
      compressible: false,
      extensions: ["vbox-extpack"]
    },
    "application/x-virtualbox-vdi": {
      compressible: true,
      extensions: ["vdi"]
    },
    "application/x-virtualbox-vhd": {
      compressible: true,
      extensions: ["vhd"]
    },
    "application/x-virtualbox-vmdk": {
      compressible: true,
      extensions: ["vmdk"]
    },
    "application/x-wais-source": {
      source: "apache",
      extensions: ["src"]
    },
    "application/x-web-app-manifest+json": {
      compressible: true,
      extensions: ["webapp"]
    },
    "application/x-www-form-urlencoded": {
      source: "iana",
      compressible: true
    },
    "application/x-x509-ca-cert": {
      source: "iana",
      extensions: ["der", "crt", "pem"]
    },
    "application/x-x509-ca-ra-cert": {
      source: "iana"
    },
    "application/x-x509-next-ca-cert": {
      source: "iana"
    },
    "application/x-xfig": {
      source: "apache",
      extensions: ["fig"]
    },
    "application/x-xliff+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/x-xpinstall": {
      source: "apache",
      compressible: false,
      extensions: ["xpi"]
    },
    "application/x-xz": {
      source: "apache",
      extensions: ["xz"]
    },
    "application/x-zmachine": {
      source: "apache",
      extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
    },
    "application/x400-bp": {
      source: "iana"
    },
    "application/xacml+xml": {
      source: "iana",
      compressible: true
    },
    "application/xaml+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xaml"]
    },
    "application/xcap-att+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xav"]
    },
    "application/xcap-caps+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xca"]
    },
    "application/xcap-diff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xdf"]
    },
    "application/xcap-el+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xel"]
    },
    "application/xcap-error+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcap-ns+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xns"]
    },
    "application/xcon-conference-info+xml": {
      source: "iana",
      compressible: true
    },
    "application/xcon-conference-info-diff+xml": {
      source: "iana",
      compressible: true
    },
    "application/xenc+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xenc"]
    },
    "application/xhtml+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xhtml", "xht"]
    },
    "application/xhtml-voice+xml": {
      source: "apache",
      compressible: true
    },
    "application/xliff+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xlf"]
    },
    "application/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml", "xsl", "xsd", "rng"]
    },
    "application/xml-dtd": {
      source: "iana",
      compressible: true,
      extensions: ["dtd"]
    },
    "application/xml-external-parsed-entity": {
      source: "iana"
    },
    "application/xml-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/xmpp+xml": {
      source: "iana",
      compressible: true
    },
    "application/xop+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xop"]
    },
    "application/xproc+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xpl"]
    },
    "application/xslt+xml": {
      source: "iana",
      compressible: true,
      extensions: ["xsl", "xslt"]
    },
    "application/xspf+xml": {
      source: "apache",
      compressible: true,
      extensions: ["xspf"]
    },
    "application/xv+xml": {
      source: "iana",
      compressible: true,
      extensions: ["mxml", "xhvml", "xvml", "xvm"]
    },
    "application/yang": {
      source: "iana",
      extensions: ["yang"]
    },
    "application/yang-data+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-data+xml": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+json": {
      source: "iana",
      compressible: true
    },
    "application/yang-patch+xml": {
      source: "iana",
      compressible: true
    },
    "application/yin+xml": {
      source: "iana",
      compressible: true,
      extensions: ["yin"]
    },
    "application/zip": {
      source: "iana",
      compressible: false,
      extensions: ["zip"]
    },
    "application/zlib": {
      source: "iana"
    },
    "application/zstd": {
      source: "iana"
    },
    "audio/1d-interleaved-parityfec": {
      source: "iana"
    },
    "audio/32kadpcm": {
      source: "iana"
    },
    "audio/3gpp": {
      source: "iana",
      compressible: false,
      extensions: ["3gpp"]
    },
    "audio/3gpp2": {
      source: "iana"
    },
    "audio/aac": {
      source: "iana"
    },
    "audio/ac3": {
      source: "iana"
    },
    "audio/adpcm": {
      source: "apache",
      extensions: ["adp"]
    },
    "audio/amr": {
      source: "iana",
      extensions: ["amr"]
    },
    "audio/amr-wb": {
      source: "iana"
    },
    "audio/amr-wb+": {
      source: "iana"
    },
    "audio/aptx": {
      source: "iana"
    },
    "audio/asc": {
      source: "iana"
    },
    "audio/atrac-advanced-lossless": {
      source: "iana"
    },
    "audio/atrac-x": {
      source: "iana"
    },
    "audio/atrac3": {
      source: "iana"
    },
    "audio/basic": {
      source: "iana",
      compressible: false,
      extensions: ["au", "snd"]
    },
    "audio/bv16": {
      source: "iana"
    },
    "audio/bv32": {
      source: "iana"
    },
    "audio/clearmode": {
      source: "iana"
    },
    "audio/cn": {
      source: "iana"
    },
    "audio/dat12": {
      source: "iana"
    },
    "audio/dls": {
      source: "iana"
    },
    "audio/dsr-es201108": {
      source: "iana"
    },
    "audio/dsr-es202050": {
      source: "iana"
    },
    "audio/dsr-es202211": {
      source: "iana"
    },
    "audio/dsr-es202212": {
      source: "iana"
    },
    "audio/dv": {
      source: "iana"
    },
    "audio/dvi4": {
      source: "iana"
    },
    "audio/eac3": {
      source: "iana"
    },
    "audio/encaprtp": {
      source: "iana"
    },
    "audio/evrc": {
      source: "iana"
    },
    "audio/evrc-qcp": {
      source: "iana"
    },
    "audio/evrc0": {
      source: "iana"
    },
    "audio/evrc1": {
      source: "iana"
    },
    "audio/evrcb": {
      source: "iana"
    },
    "audio/evrcb0": {
      source: "iana"
    },
    "audio/evrcb1": {
      source: "iana"
    },
    "audio/evrcnw": {
      source: "iana"
    },
    "audio/evrcnw0": {
      source: "iana"
    },
    "audio/evrcnw1": {
      source: "iana"
    },
    "audio/evrcwb": {
      source: "iana"
    },
    "audio/evrcwb0": {
      source: "iana"
    },
    "audio/evrcwb1": {
      source: "iana"
    },
    "audio/evs": {
      source: "iana"
    },
    "audio/flexfec": {
      source: "iana"
    },
    "audio/fwdred": {
      source: "iana"
    },
    "audio/g711-0": {
      source: "iana"
    },
    "audio/g719": {
      source: "iana"
    },
    "audio/g722": {
      source: "iana"
    },
    "audio/g7221": {
      source: "iana"
    },
    "audio/g723": {
      source: "iana"
    },
    "audio/g726-16": {
      source: "iana"
    },
    "audio/g726-24": {
      source: "iana"
    },
    "audio/g726-32": {
      source: "iana"
    },
    "audio/g726-40": {
      source: "iana"
    },
    "audio/g728": {
      source: "iana"
    },
    "audio/g729": {
      source: "iana"
    },
    "audio/g7291": {
      source: "iana"
    },
    "audio/g729d": {
      source: "iana"
    },
    "audio/g729e": {
      source: "iana"
    },
    "audio/gsm": {
      source: "iana"
    },
    "audio/gsm-efr": {
      source: "iana"
    },
    "audio/gsm-hr-08": {
      source: "iana"
    },
    "audio/ilbc": {
      source: "iana"
    },
    "audio/ip-mr_v2.5": {
      source: "iana"
    },
    "audio/isac": {
      source: "apache"
    },
    "audio/l16": {
      source: "iana"
    },
    "audio/l20": {
      source: "iana"
    },
    "audio/l24": {
      source: "iana",
      compressible: false
    },
    "audio/l8": {
      source: "iana"
    },
    "audio/lpc": {
      source: "iana"
    },
    "audio/melp": {
      source: "iana"
    },
    "audio/melp1200": {
      source: "iana"
    },
    "audio/melp2400": {
      source: "iana"
    },
    "audio/melp600": {
      source: "iana"
    },
    "audio/mhas": {
      source: "iana"
    },
    "audio/midi": {
      source: "apache",
      extensions: ["mid", "midi", "kar", "rmi"]
    },
    "audio/mobile-xmf": {
      source: "iana",
      extensions: ["mxmf"]
    },
    "audio/mp3": {
      compressible: false,
      extensions: ["mp3"]
    },
    "audio/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["m4a", "mp4a"]
    },
    "audio/mp4a-latm": {
      source: "iana"
    },
    "audio/mpa": {
      source: "iana"
    },
    "audio/mpa-robust": {
      source: "iana"
    },
    "audio/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
    },
    "audio/mpeg4-generic": {
      source: "iana"
    },
    "audio/musepack": {
      source: "apache"
    },
    "audio/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["oga", "ogg", "spx", "opus"]
    },
    "audio/opus": {
      source: "iana"
    },
    "audio/parityfec": {
      source: "iana"
    },
    "audio/pcma": {
      source: "iana"
    },
    "audio/pcma-wb": {
      source: "iana"
    },
    "audio/pcmu": {
      source: "iana"
    },
    "audio/pcmu-wb": {
      source: "iana"
    },
    "audio/prs.sid": {
      source: "iana"
    },
    "audio/qcelp": {
      source: "iana"
    },
    "audio/raptorfec": {
      source: "iana"
    },
    "audio/red": {
      source: "iana"
    },
    "audio/rtp-enc-aescm128": {
      source: "iana"
    },
    "audio/rtp-midi": {
      source: "iana"
    },
    "audio/rtploopback": {
      source: "iana"
    },
    "audio/rtx": {
      source: "iana"
    },
    "audio/s3m": {
      source: "apache",
      extensions: ["s3m"]
    },
    "audio/scip": {
      source: "iana"
    },
    "audio/silk": {
      source: "apache",
      extensions: ["sil"]
    },
    "audio/smv": {
      source: "iana"
    },
    "audio/smv-qcp": {
      source: "iana"
    },
    "audio/smv0": {
      source: "iana"
    },
    "audio/sofa": {
      source: "iana"
    },
    "audio/sp-midi": {
      source: "iana"
    },
    "audio/speex": {
      source: "iana"
    },
    "audio/t140c": {
      source: "iana"
    },
    "audio/t38": {
      source: "iana"
    },
    "audio/telephone-event": {
      source: "iana"
    },
    "audio/tetra_acelp": {
      source: "iana"
    },
    "audio/tetra_acelp_bb": {
      source: "iana"
    },
    "audio/tone": {
      source: "iana"
    },
    "audio/tsvcis": {
      source: "iana"
    },
    "audio/uemclip": {
      source: "iana"
    },
    "audio/ulpfec": {
      source: "iana"
    },
    "audio/usac": {
      source: "iana"
    },
    "audio/vdvi": {
      source: "iana"
    },
    "audio/vmr-wb": {
      source: "iana"
    },
    "audio/vnd.3gpp.iufp": {
      source: "iana"
    },
    "audio/vnd.4sb": {
      source: "iana"
    },
    "audio/vnd.audiokoz": {
      source: "iana"
    },
    "audio/vnd.celp": {
      source: "iana"
    },
    "audio/vnd.cisco.nse": {
      source: "iana"
    },
    "audio/vnd.cmles.radio-events": {
      source: "iana"
    },
    "audio/vnd.cns.anp1": {
      source: "iana"
    },
    "audio/vnd.cns.inf1": {
      source: "iana"
    },
    "audio/vnd.dece.audio": {
      source: "iana",
      extensions: ["uva", "uvva"]
    },
    "audio/vnd.digital-winds": {
      source: "iana",
      extensions: ["eol"]
    },
    "audio/vnd.dlna.adts": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.1": {
      source: "iana"
    },
    "audio/vnd.dolby.heaac.2": {
      source: "iana"
    },
    "audio/vnd.dolby.mlp": {
      source: "iana"
    },
    "audio/vnd.dolby.mps": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2x": {
      source: "iana"
    },
    "audio/vnd.dolby.pl2z": {
      source: "iana"
    },
    "audio/vnd.dolby.pulse.1": {
      source: "iana"
    },
    "audio/vnd.dra": {
      source: "iana",
      extensions: ["dra"]
    },
    "audio/vnd.dts": {
      source: "iana",
      extensions: ["dts"]
    },
    "audio/vnd.dts.hd": {
      source: "iana",
      extensions: ["dtshd"]
    },
    "audio/vnd.dts.uhd": {
      source: "iana"
    },
    "audio/vnd.dvb.file": {
      source: "iana"
    },
    "audio/vnd.everad.plj": {
      source: "iana"
    },
    "audio/vnd.hns.audio": {
      source: "iana"
    },
    "audio/vnd.lucent.voice": {
      source: "iana",
      extensions: ["lvp"]
    },
    "audio/vnd.ms-playready.media.pya": {
      source: "iana",
      extensions: ["pya"]
    },
    "audio/vnd.nokia.mobile-xmf": {
      source: "iana"
    },
    "audio/vnd.nortel.vbk": {
      source: "iana"
    },
    "audio/vnd.nuera.ecelp4800": {
      source: "iana",
      extensions: ["ecelp4800"]
    },
    "audio/vnd.nuera.ecelp7470": {
      source: "iana",
      extensions: ["ecelp7470"]
    },
    "audio/vnd.nuera.ecelp9600": {
      source: "iana",
      extensions: ["ecelp9600"]
    },
    "audio/vnd.octel.sbc": {
      source: "iana"
    },
    "audio/vnd.presonus.multitrack": {
      source: "iana"
    },
    "audio/vnd.qcelp": {
      source: "iana"
    },
    "audio/vnd.rhetorex.32kadpcm": {
      source: "iana"
    },
    "audio/vnd.rip": {
      source: "iana",
      extensions: ["rip"]
    },
    "audio/vnd.rn-realaudio": {
      compressible: false
    },
    "audio/vnd.sealedmedia.softseal.mpeg": {
      source: "iana"
    },
    "audio/vnd.vmx.cvsd": {
      source: "iana"
    },
    "audio/vnd.wave": {
      compressible: false
    },
    "audio/vorbis": {
      source: "iana",
      compressible: false
    },
    "audio/vorbis-config": {
      source: "iana"
    },
    "audio/wav": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/wave": {
      compressible: false,
      extensions: ["wav"]
    },
    "audio/webm": {
      source: "apache",
      compressible: false,
      extensions: ["weba"]
    },
    "audio/x-aac": {
      source: "apache",
      compressible: false,
      extensions: ["aac"]
    },
    "audio/x-aiff": {
      source: "apache",
      extensions: ["aif", "aiff", "aifc"]
    },
    "audio/x-caf": {
      source: "apache",
      compressible: false,
      extensions: ["caf"]
    },
    "audio/x-flac": {
      source: "apache",
      extensions: ["flac"]
    },
    "audio/x-m4a": {
      source: "nginx",
      extensions: ["m4a"]
    },
    "audio/x-matroska": {
      source: "apache",
      extensions: ["mka"]
    },
    "audio/x-mpegurl": {
      source: "apache",
      extensions: ["m3u"]
    },
    "audio/x-ms-wax": {
      source: "apache",
      extensions: ["wax"]
    },
    "audio/x-ms-wma": {
      source: "apache",
      extensions: ["wma"]
    },
    "audio/x-pn-realaudio": {
      source: "apache",
      extensions: ["ram", "ra"]
    },
    "audio/x-pn-realaudio-plugin": {
      source: "apache",
      extensions: ["rmp"]
    },
    "audio/x-realaudio": {
      source: "nginx",
      extensions: ["ra"]
    },
    "audio/x-tta": {
      source: "apache"
    },
    "audio/x-wav": {
      source: "apache",
      extensions: ["wav"]
    },
    "audio/xm": {
      source: "apache",
      extensions: ["xm"]
    },
    "chemical/x-cdx": {
      source: "apache",
      extensions: ["cdx"]
    },
    "chemical/x-cif": {
      source: "apache",
      extensions: ["cif"]
    },
    "chemical/x-cmdf": {
      source: "apache",
      extensions: ["cmdf"]
    },
    "chemical/x-cml": {
      source: "apache",
      extensions: ["cml"]
    },
    "chemical/x-csml": {
      source: "apache",
      extensions: ["csml"]
    },
    "chemical/x-pdb": {
      source: "apache"
    },
    "chemical/x-xyz": {
      source: "apache",
      extensions: ["xyz"]
    },
    "font/collection": {
      source: "iana",
      extensions: ["ttc"]
    },
    "font/otf": {
      source: "iana",
      compressible: true,
      extensions: ["otf"]
    },
    "font/sfnt": {
      source: "iana"
    },
    "font/ttf": {
      source: "iana",
      compressible: true,
      extensions: ["ttf"]
    },
    "font/woff": {
      source: "iana",
      extensions: ["woff"]
    },
    "font/woff2": {
      source: "iana",
      extensions: ["woff2"]
    },
    "image/aces": {
      source: "iana",
      extensions: ["exr"]
    },
    "image/apng": {
      compressible: false,
      extensions: ["apng"]
    },
    "image/avci": {
      source: "iana",
      extensions: ["avci"]
    },
    "image/avcs": {
      source: "iana",
      extensions: ["avcs"]
    },
    "image/avif": {
      source: "iana",
      compressible: false,
      extensions: ["avif"]
    },
    "image/bmp": {
      source: "iana",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/cgm": {
      source: "iana",
      extensions: ["cgm"]
    },
    "image/dicom-rle": {
      source: "iana",
      extensions: ["drle"]
    },
    "image/emf": {
      source: "iana",
      extensions: ["emf"]
    },
    "image/fits": {
      source: "iana",
      extensions: ["fits"]
    },
    "image/g3fax": {
      source: "iana",
      extensions: ["g3"]
    },
    "image/gif": {
      source: "iana",
      compressible: false,
      extensions: ["gif"]
    },
    "image/heic": {
      source: "iana",
      extensions: ["heic"]
    },
    "image/heic-sequence": {
      source: "iana",
      extensions: ["heics"]
    },
    "image/heif": {
      source: "iana",
      extensions: ["heif"]
    },
    "image/heif-sequence": {
      source: "iana",
      extensions: ["heifs"]
    },
    "image/hej2k": {
      source: "iana",
      extensions: ["hej2"]
    },
    "image/hsj2": {
      source: "iana",
      extensions: ["hsj2"]
    },
    "image/ief": {
      source: "iana",
      extensions: ["ief"]
    },
    "image/jls": {
      source: "iana",
      extensions: ["jls"]
    },
    "image/jp2": {
      source: "iana",
      compressible: false,
      extensions: ["jp2", "jpg2"]
    },
    "image/jpeg": {
      source: "iana",
      compressible: false,
      extensions: ["jpeg", "jpg", "jpe"]
    },
    "image/jph": {
      source: "iana",
      extensions: ["jph"]
    },
    "image/jphc": {
      source: "iana",
      extensions: ["jhc"]
    },
    "image/jpm": {
      source: "iana",
      compressible: false,
      extensions: ["jpm"]
    },
    "image/jpx": {
      source: "iana",
      compressible: false,
      extensions: ["jpx", "jpf"]
    },
    "image/jxr": {
      source: "iana",
      extensions: ["jxr"]
    },
    "image/jxra": {
      source: "iana",
      extensions: ["jxra"]
    },
    "image/jxrs": {
      source: "iana",
      extensions: ["jxrs"]
    },
    "image/jxs": {
      source: "iana",
      extensions: ["jxs"]
    },
    "image/jxsc": {
      source: "iana",
      extensions: ["jxsc"]
    },
    "image/jxsi": {
      source: "iana",
      extensions: ["jxsi"]
    },
    "image/jxss": {
      source: "iana",
      extensions: ["jxss"]
    },
    "image/ktx": {
      source: "iana",
      extensions: ["ktx"]
    },
    "image/ktx2": {
      source: "iana",
      extensions: ["ktx2"]
    },
    "image/naplps": {
      source: "iana"
    },
    "image/pjpeg": {
      compressible: false
    },
    "image/png": {
      source: "iana",
      compressible: false,
      extensions: ["png"]
    },
    "image/prs.btif": {
      source: "iana",
      extensions: ["btif"]
    },
    "image/prs.pti": {
      source: "iana",
      extensions: ["pti"]
    },
    "image/pwg-raster": {
      source: "iana"
    },
    "image/sgi": {
      source: "apache",
      extensions: ["sgi"]
    },
    "image/svg+xml": {
      source: "iana",
      compressible: true,
      extensions: ["svg", "svgz"]
    },
    "image/t38": {
      source: "iana",
      extensions: ["t38"]
    },
    "image/tiff": {
      source: "iana",
      compressible: false,
      extensions: ["tif", "tiff"]
    },
    "image/tiff-fx": {
      source: "iana",
      extensions: ["tfx"]
    },
    "image/vnd.adobe.photoshop": {
      source: "iana",
      compressible: true,
      extensions: ["psd"]
    },
    "image/vnd.airzip.accelerator.azv": {
      source: "iana",
      extensions: ["azv"]
    },
    "image/vnd.cns.inf2": {
      source: "iana"
    },
    "image/vnd.dece.graphic": {
      source: "iana",
      extensions: ["uvi", "uvvi", "uvg", "uvvg"]
    },
    "image/vnd.djvu": {
      source: "iana",
      extensions: ["djvu", "djv"]
    },
    "image/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "image/vnd.dwg": {
      source: "iana",
      extensions: ["dwg"]
    },
    "image/vnd.dxf": {
      source: "iana",
      extensions: ["dxf"]
    },
    "image/vnd.fastbidsheet": {
      source: "iana",
      extensions: ["fbs"]
    },
    "image/vnd.fpx": {
      source: "iana",
      extensions: ["fpx"]
    },
    "image/vnd.fst": {
      source: "iana",
      extensions: ["fst"]
    },
    "image/vnd.fujixerox.edmics-mmr": {
      source: "iana",
      extensions: ["mmr"]
    },
    "image/vnd.fujixerox.edmics-rlc": {
      source: "iana",
      extensions: ["rlc"]
    },
    "image/vnd.globalgraphics.pgb": {
      source: "iana"
    },
    "image/vnd.microsoft.icon": {
      source: "iana",
      compressible: true,
      extensions: ["ico"]
    },
    "image/vnd.mix": {
      source: "iana"
    },
    "image/vnd.mozilla.apng": {
      source: "iana"
    },
    "image/vnd.ms-dds": {
      compressible: true,
      extensions: ["dds"]
    },
    "image/vnd.ms-modi": {
      source: "iana",
      extensions: ["mdi"]
    },
    "image/vnd.ms-photo": {
      source: "apache",
      extensions: ["wdp"]
    },
    "image/vnd.net-fpx": {
      source: "iana",
      extensions: ["npx"]
    },
    "image/vnd.pco.b16": {
      source: "iana",
      extensions: ["b16"]
    },
    "image/vnd.radiance": {
      source: "iana"
    },
    "image/vnd.sealed.png": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.gif": {
      source: "iana"
    },
    "image/vnd.sealedmedia.softseal.jpg": {
      source: "iana"
    },
    "image/vnd.svf": {
      source: "iana"
    },
    "image/vnd.tencent.tap": {
      source: "iana",
      extensions: ["tap"]
    },
    "image/vnd.valve.source.texture": {
      source: "iana",
      extensions: ["vtf"]
    },
    "image/vnd.wap.wbmp": {
      source: "iana",
      extensions: ["wbmp"]
    },
    "image/vnd.xiff": {
      source: "iana",
      extensions: ["xif"]
    },
    "image/vnd.zbrush.pcx": {
      source: "iana",
      extensions: ["pcx"]
    },
    "image/webp": {
      source: "apache",
      extensions: ["webp"]
    },
    "image/wmf": {
      source: "iana",
      extensions: ["wmf"]
    },
    "image/x-3ds": {
      source: "apache",
      extensions: ["3ds"]
    },
    "image/x-cmu-raster": {
      source: "apache",
      extensions: ["ras"]
    },
    "image/x-cmx": {
      source: "apache",
      extensions: ["cmx"]
    },
    "image/x-freehand": {
      source: "apache",
      extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
    },
    "image/x-icon": {
      source: "apache",
      compressible: true,
      extensions: ["ico"]
    },
    "image/x-jng": {
      source: "nginx",
      extensions: ["jng"]
    },
    "image/x-mrsid-image": {
      source: "apache",
      extensions: ["sid"]
    },
    "image/x-ms-bmp": {
      source: "nginx",
      compressible: true,
      extensions: ["bmp"]
    },
    "image/x-pcx": {
      source: "apache",
      extensions: ["pcx"]
    },
    "image/x-pict": {
      source: "apache",
      extensions: ["pic", "pct"]
    },
    "image/x-portable-anymap": {
      source: "apache",
      extensions: ["pnm"]
    },
    "image/x-portable-bitmap": {
      source: "apache",
      extensions: ["pbm"]
    },
    "image/x-portable-graymap": {
      source: "apache",
      extensions: ["pgm"]
    },
    "image/x-portable-pixmap": {
      source: "apache",
      extensions: ["ppm"]
    },
    "image/x-rgb": {
      source: "apache",
      extensions: ["rgb"]
    },
    "image/x-tga": {
      source: "apache",
      extensions: ["tga"]
    },
    "image/x-xbitmap": {
      source: "apache",
      extensions: ["xbm"]
    },
    "image/x-xcf": {
      compressible: false
    },
    "image/x-xpixmap": {
      source: "apache",
      extensions: ["xpm"]
    },
    "image/x-xwindowdump": {
      source: "apache",
      extensions: ["xwd"]
    },
    "message/cpim": {
      source: "iana"
    },
    "message/delivery-status": {
      source: "iana"
    },
    "message/disposition-notification": {
      source: "iana",
      extensions: [
        "disposition-notification"
      ]
    },
    "message/external-body": {
      source: "iana"
    },
    "message/feedback-report": {
      source: "iana"
    },
    "message/global": {
      source: "iana",
      extensions: ["u8msg"]
    },
    "message/global-delivery-status": {
      source: "iana",
      extensions: ["u8dsn"]
    },
    "message/global-disposition-notification": {
      source: "iana",
      extensions: ["u8mdn"]
    },
    "message/global-headers": {
      source: "iana",
      extensions: ["u8hdr"]
    },
    "message/http": {
      source: "iana",
      compressible: false
    },
    "message/imdn+xml": {
      source: "iana",
      compressible: true
    },
    "message/news": {
      source: "iana"
    },
    "message/partial": {
      source: "iana",
      compressible: false
    },
    "message/rfc822": {
      source: "iana",
      compressible: true,
      extensions: ["eml", "mime"]
    },
    "message/s-http": {
      source: "iana"
    },
    "message/sip": {
      source: "iana"
    },
    "message/sipfrag": {
      source: "iana"
    },
    "message/tracking-status": {
      source: "iana"
    },
    "message/vnd.si.simp": {
      source: "iana"
    },
    "message/vnd.wfa.wsc": {
      source: "iana",
      extensions: ["wsc"]
    },
    "model/3mf": {
      source: "iana",
      extensions: ["3mf"]
    },
    "model/e57": {
      source: "iana"
    },
    "model/gltf+json": {
      source: "iana",
      compressible: true,
      extensions: ["gltf"]
    },
    "model/gltf-binary": {
      source: "iana",
      compressible: true,
      extensions: ["glb"]
    },
    "model/iges": {
      source: "iana",
      compressible: false,
      extensions: ["igs", "iges"]
    },
    "model/mesh": {
      source: "iana",
      compressible: false,
      extensions: ["msh", "mesh", "silo"]
    },
    "model/mtl": {
      source: "iana",
      extensions: ["mtl"]
    },
    "model/obj": {
      source: "iana",
      extensions: ["obj"]
    },
    "model/step": {
      source: "iana"
    },
    "model/step+xml": {
      source: "iana",
      compressible: true,
      extensions: ["stpx"]
    },
    "model/step+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpz"]
    },
    "model/step-xml+zip": {
      source: "iana",
      compressible: false,
      extensions: ["stpxz"]
    },
    "model/stl": {
      source: "iana",
      extensions: ["stl"]
    },
    "model/vnd.collada+xml": {
      source: "iana",
      compressible: true,
      extensions: ["dae"]
    },
    "model/vnd.dwf": {
      source: "iana",
      extensions: ["dwf"]
    },
    "model/vnd.flatland.3dml": {
      source: "iana"
    },
    "model/vnd.gdl": {
      source: "iana",
      extensions: ["gdl"]
    },
    "model/vnd.gs-gdl": {
      source: "apache"
    },
    "model/vnd.gs.gdl": {
      source: "iana"
    },
    "model/vnd.gtw": {
      source: "iana",
      extensions: ["gtw"]
    },
    "model/vnd.moml+xml": {
      source: "iana",
      compressible: true
    },
    "model/vnd.mts": {
      source: "iana",
      extensions: ["mts"]
    },
    "model/vnd.opengex": {
      source: "iana",
      extensions: ["ogex"]
    },
    "model/vnd.parasolid.transmit.binary": {
      source: "iana",
      extensions: ["x_b"]
    },
    "model/vnd.parasolid.transmit.text": {
      source: "iana",
      extensions: ["x_t"]
    },
    "model/vnd.pytha.pyox": {
      source: "iana"
    },
    "model/vnd.rosette.annotated-data-model": {
      source: "iana"
    },
    "model/vnd.sap.vds": {
      source: "iana",
      extensions: ["vds"]
    },
    "model/vnd.usdz+zip": {
      source: "iana",
      compressible: false,
      extensions: ["usdz"]
    },
    "model/vnd.valve.source.compiled-map": {
      source: "iana",
      extensions: ["bsp"]
    },
    "model/vnd.vtu": {
      source: "iana",
      extensions: ["vtu"]
    },
    "model/vrml": {
      source: "iana",
      compressible: false,
      extensions: ["wrl", "vrml"]
    },
    "model/x3d+binary": {
      source: "apache",
      compressible: false,
      extensions: ["x3db", "x3dbz"]
    },
    "model/x3d+fastinfoset": {
      source: "iana",
      extensions: ["x3db"]
    },
    "model/x3d+vrml": {
      source: "apache",
      compressible: false,
      extensions: ["x3dv", "x3dvz"]
    },
    "model/x3d+xml": {
      source: "iana",
      compressible: true,
      extensions: ["x3d", "x3dz"]
    },
    "model/x3d-vrml": {
      source: "iana",
      extensions: ["x3dv"]
    },
    "multipart/alternative": {
      source: "iana",
      compressible: false
    },
    "multipart/appledouble": {
      source: "iana"
    },
    "multipart/byteranges": {
      source: "iana"
    },
    "multipart/digest": {
      source: "iana"
    },
    "multipart/encrypted": {
      source: "iana",
      compressible: false
    },
    "multipart/form-data": {
      source: "iana",
      compressible: false
    },
    "multipart/header-set": {
      source: "iana"
    },
    "multipart/mixed": {
      source: "iana"
    },
    "multipart/multilingual": {
      source: "iana"
    },
    "multipart/parallel": {
      source: "iana"
    },
    "multipart/related": {
      source: "iana",
      compressible: false
    },
    "multipart/report": {
      source: "iana"
    },
    "multipart/signed": {
      source: "iana",
      compressible: false
    },
    "multipart/vnd.bint.med-plus": {
      source: "iana"
    },
    "multipart/voice-message": {
      source: "iana"
    },
    "multipart/x-mixed-replace": {
      source: "iana"
    },
    "text/1d-interleaved-parityfec": {
      source: "iana"
    },
    "text/cache-manifest": {
      source: "iana",
      compressible: true,
      extensions: ["appcache", "manifest"]
    },
    "text/calendar": {
      source: "iana",
      extensions: ["ics", "ifb"]
    },
    "text/calender": {
      compressible: true
    },
    "text/cmd": {
      compressible: true
    },
    "text/coffeescript": {
      extensions: ["coffee", "litcoffee"]
    },
    "text/cql": {
      source: "iana"
    },
    "text/cql-expression": {
      source: "iana"
    },
    "text/cql-identifier": {
      source: "iana"
    },
    "text/css": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["css"]
    },
    "text/csv": {
      source: "iana",
      compressible: true,
      extensions: ["csv"]
    },
    "text/csv-schema": {
      source: "iana"
    },
    "text/directory": {
      source: "iana"
    },
    "text/dns": {
      source: "iana"
    },
    "text/ecmascript": {
      source: "iana"
    },
    "text/encaprtp": {
      source: "iana"
    },
    "text/enriched": {
      source: "iana"
    },
    "text/fhirpath": {
      source: "iana"
    },
    "text/flexfec": {
      source: "iana"
    },
    "text/fwdred": {
      source: "iana"
    },
    "text/gff3": {
      source: "iana"
    },
    "text/grammar-ref-list": {
      source: "iana"
    },
    "text/html": {
      source: "iana",
      compressible: true,
      extensions: ["html", "htm", "shtml"]
    },
    "text/jade": {
      extensions: ["jade"]
    },
    "text/javascript": {
      source: "iana",
      compressible: true
    },
    "text/jcr-cnd": {
      source: "iana"
    },
    "text/jsx": {
      compressible: true,
      extensions: ["jsx"]
    },
    "text/less": {
      compressible: true,
      extensions: ["less"]
    },
    "text/markdown": {
      source: "iana",
      compressible: true,
      extensions: ["markdown", "md"]
    },
    "text/mathml": {
      source: "nginx",
      extensions: ["mml"]
    },
    "text/mdx": {
      compressible: true,
      extensions: ["mdx"]
    },
    "text/mizar": {
      source: "iana"
    },
    "text/n3": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["n3"]
    },
    "text/parameters": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/parityfec": {
      source: "iana"
    },
    "text/plain": {
      source: "iana",
      compressible: true,
      extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
    },
    "text/provenance-notation": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/prs.fallenstein.rst": {
      source: "iana"
    },
    "text/prs.lines.tag": {
      source: "iana",
      extensions: ["dsc"]
    },
    "text/prs.prop.logic": {
      source: "iana"
    },
    "text/raptorfec": {
      source: "iana"
    },
    "text/red": {
      source: "iana"
    },
    "text/rfc822-headers": {
      source: "iana"
    },
    "text/richtext": {
      source: "iana",
      compressible: true,
      extensions: ["rtx"]
    },
    "text/rtf": {
      source: "iana",
      compressible: true,
      extensions: ["rtf"]
    },
    "text/rtp-enc-aescm128": {
      source: "iana"
    },
    "text/rtploopback": {
      source: "iana"
    },
    "text/rtx": {
      source: "iana"
    },
    "text/sgml": {
      source: "iana",
      extensions: ["sgml", "sgm"]
    },
    "text/shaclc": {
      source: "iana"
    },
    "text/shex": {
      source: "iana",
      extensions: ["shex"]
    },
    "text/slim": {
      extensions: ["slim", "slm"]
    },
    "text/spdx": {
      source: "iana",
      extensions: ["spdx"]
    },
    "text/strings": {
      source: "iana"
    },
    "text/stylus": {
      extensions: ["stylus", "styl"]
    },
    "text/t140": {
      source: "iana"
    },
    "text/tab-separated-values": {
      source: "iana",
      compressible: true,
      extensions: ["tsv"]
    },
    "text/troff": {
      source: "iana",
      extensions: ["t", "tr", "roff", "man", "me", "ms"]
    },
    "text/turtle": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["ttl"]
    },
    "text/ulpfec": {
      source: "iana"
    },
    "text/uri-list": {
      source: "iana",
      compressible: true,
      extensions: ["uri", "uris", "urls"]
    },
    "text/vcard": {
      source: "iana",
      compressible: true,
      extensions: ["vcard"]
    },
    "text/vnd.a": {
      source: "iana"
    },
    "text/vnd.abc": {
      source: "iana"
    },
    "text/vnd.ascii-art": {
      source: "iana"
    },
    "text/vnd.curl": {
      source: "iana",
      extensions: ["curl"]
    },
    "text/vnd.curl.dcurl": {
      source: "apache",
      extensions: ["dcurl"]
    },
    "text/vnd.curl.mcurl": {
      source: "apache",
      extensions: ["mcurl"]
    },
    "text/vnd.curl.scurl": {
      source: "apache",
      extensions: ["scurl"]
    },
    "text/vnd.debian.copyright": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.dmclientscript": {
      source: "iana"
    },
    "text/vnd.dvb.subtitle": {
      source: "iana",
      extensions: ["sub"]
    },
    "text/vnd.esmertec.theme-descriptor": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.familysearch.gedcom": {
      source: "iana",
      extensions: ["ged"]
    },
    "text/vnd.ficlab.flt": {
      source: "iana"
    },
    "text/vnd.fly": {
      source: "iana",
      extensions: ["fly"]
    },
    "text/vnd.fmi.flexstor": {
      source: "iana",
      extensions: ["flx"]
    },
    "text/vnd.gml": {
      source: "iana"
    },
    "text/vnd.graphviz": {
      source: "iana",
      extensions: ["gv"]
    },
    "text/vnd.hans": {
      source: "iana"
    },
    "text/vnd.hgl": {
      source: "iana"
    },
    "text/vnd.in3d.3dml": {
      source: "iana",
      extensions: ["3dml"]
    },
    "text/vnd.in3d.spot": {
      source: "iana",
      extensions: ["spot"]
    },
    "text/vnd.iptc.newsml": {
      source: "iana"
    },
    "text/vnd.iptc.nitf": {
      source: "iana"
    },
    "text/vnd.latex-z": {
      source: "iana"
    },
    "text/vnd.motorola.reflex": {
      source: "iana"
    },
    "text/vnd.ms-mediapackage": {
      source: "iana"
    },
    "text/vnd.net2phone.commcenter.command": {
      source: "iana"
    },
    "text/vnd.radisys.msml-basic-layout": {
      source: "iana"
    },
    "text/vnd.senx.warpscript": {
      source: "iana"
    },
    "text/vnd.si.uricatalogue": {
      source: "iana"
    },
    "text/vnd.sosi": {
      source: "iana"
    },
    "text/vnd.sun.j2me.app-descriptor": {
      source: "iana",
      charset: "UTF-8",
      extensions: ["jad"]
    },
    "text/vnd.trolltech.linguist": {
      source: "iana",
      charset: "UTF-8"
    },
    "text/vnd.wap.si": {
      source: "iana"
    },
    "text/vnd.wap.sl": {
      source: "iana"
    },
    "text/vnd.wap.wml": {
      source: "iana",
      extensions: ["wml"]
    },
    "text/vnd.wap.wmlscript": {
      source: "iana",
      extensions: ["wmls"]
    },
    "text/vtt": {
      source: "iana",
      charset: "UTF-8",
      compressible: true,
      extensions: ["vtt"]
    },
    "text/x-asm": {
      source: "apache",
      extensions: ["s", "asm"]
    },
    "text/x-c": {
      source: "apache",
      extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
    },
    "text/x-component": {
      source: "nginx",
      extensions: ["htc"]
    },
    "text/x-fortran": {
      source: "apache",
      extensions: ["f", "for", "f77", "f90"]
    },
    "text/x-gwt-rpc": {
      compressible: true
    },
    "text/x-handlebars-template": {
      extensions: ["hbs"]
    },
    "text/x-java-source": {
      source: "apache",
      extensions: ["java"]
    },
    "text/x-jquery-tmpl": {
      compressible: true
    },
    "text/x-lua": {
      extensions: ["lua"]
    },
    "text/x-markdown": {
      compressible: true,
      extensions: ["mkd"]
    },
    "text/x-nfo": {
      source: "apache",
      extensions: ["nfo"]
    },
    "text/x-opml": {
      source: "apache",
      extensions: ["opml"]
    },
    "text/x-org": {
      compressible: true,
      extensions: ["org"]
    },
    "text/x-pascal": {
      source: "apache",
      extensions: ["p", "pas"]
    },
    "text/x-processing": {
      compressible: true,
      extensions: ["pde"]
    },
    "text/x-sass": {
      extensions: ["sass"]
    },
    "text/x-scss": {
      extensions: ["scss"]
    },
    "text/x-setext": {
      source: "apache",
      extensions: ["etx"]
    },
    "text/x-sfv": {
      source: "apache",
      extensions: ["sfv"]
    },
    "text/x-suse-ymp": {
      compressible: true,
      extensions: ["ymp"]
    },
    "text/x-uuencode": {
      source: "apache",
      extensions: ["uu"]
    },
    "text/x-vcalendar": {
      source: "apache",
      extensions: ["vcs"]
    },
    "text/x-vcard": {
      source: "apache",
      extensions: ["vcf"]
    },
    "text/xml": {
      source: "iana",
      compressible: true,
      extensions: ["xml"]
    },
    "text/xml-external-parsed-entity": {
      source: "iana"
    },
    "text/yaml": {
      compressible: true,
      extensions: ["yaml", "yml"]
    },
    "video/1d-interleaved-parityfec": {
      source: "iana"
    },
    "video/3gpp": {
      source: "iana",
      extensions: ["3gp", "3gpp"]
    },
    "video/3gpp-tt": {
      source: "iana"
    },
    "video/3gpp2": {
      source: "iana",
      extensions: ["3g2"]
    },
    "video/av1": {
      source: "iana"
    },
    "video/bmpeg": {
      source: "iana"
    },
    "video/bt656": {
      source: "iana"
    },
    "video/celb": {
      source: "iana"
    },
    "video/dv": {
      source: "iana"
    },
    "video/encaprtp": {
      source: "iana"
    },
    "video/ffv1": {
      source: "iana"
    },
    "video/flexfec": {
      source: "iana"
    },
    "video/h261": {
      source: "iana",
      extensions: ["h261"]
    },
    "video/h263": {
      source: "iana",
      extensions: ["h263"]
    },
    "video/h263-1998": {
      source: "iana"
    },
    "video/h263-2000": {
      source: "iana"
    },
    "video/h264": {
      source: "iana",
      extensions: ["h264"]
    },
    "video/h264-rcdo": {
      source: "iana"
    },
    "video/h264-svc": {
      source: "iana"
    },
    "video/h265": {
      source: "iana"
    },
    "video/iso.segment": {
      source: "iana",
      extensions: ["m4s"]
    },
    "video/jpeg": {
      source: "iana",
      extensions: ["jpgv"]
    },
    "video/jpeg2000": {
      source: "iana"
    },
    "video/jpm": {
      source: "apache",
      extensions: ["jpm", "jpgm"]
    },
    "video/jxsv": {
      source: "iana"
    },
    "video/mj2": {
      source: "iana",
      extensions: ["mj2", "mjp2"]
    },
    "video/mp1s": {
      source: "iana"
    },
    "video/mp2p": {
      source: "iana"
    },
    "video/mp2t": {
      source: "iana",
      extensions: ["ts"]
    },
    "video/mp4": {
      source: "iana",
      compressible: false,
      extensions: ["mp4", "mp4v", "mpg4"]
    },
    "video/mp4v-es": {
      source: "iana"
    },
    "video/mpeg": {
      source: "iana",
      compressible: false,
      extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
    },
    "video/mpeg4-generic": {
      source: "iana"
    },
    "video/mpv": {
      source: "iana"
    },
    "video/nv": {
      source: "iana"
    },
    "video/ogg": {
      source: "iana",
      compressible: false,
      extensions: ["ogv"]
    },
    "video/parityfec": {
      source: "iana"
    },
    "video/pointer": {
      source: "iana"
    },
    "video/quicktime": {
      source: "iana",
      compressible: false,
      extensions: ["qt", "mov"]
    },
    "video/raptorfec": {
      source: "iana"
    },
    "video/raw": {
      source: "iana"
    },
    "video/rtp-enc-aescm128": {
      source: "iana"
    },
    "video/rtploopback": {
      source: "iana"
    },
    "video/rtx": {
      source: "iana"
    },
    "video/scip": {
      source: "iana"
    },
    "video/smpte291": {
      source: "iana"
    },
    "video/smpte292m": {
      source: "iana"
    },
    "video/ulpfec": {
      source: "iana"
    },
    "video/vc1": {
      source: "iana"
    },
    "video/vc2": {
      source: "iana"
    },
    "video/vnd.cctv": {
      source: "iana"
    },
    "video/vnd.dece.hd": {
      source: "iana",
      extensions: ["uvh", "uvvh"]
    },
    "video/vnd.dece.mobile": {
      source: "iana",
      extensions: ["uvm", "uvvm"]
    },
    "video/vnd.dece.mp4": {
      source: "iana"
    },
    "video/vnd.dece.pd": {
      source: "iana",
      extensions: ["uvp", "uvvp"]
    },
    "video/vnd.dece.sd": {
      source: "iana",
      extensions: ["uvs", "uvvs"]
    },
    "video/vnd.dece.video": {
      source: "iana",
      extensions: ["uvv", "uvvv"]
    },
    "video/vnd.directv.mpeg": {
      source: "iana"
    },
    "video/vnd.directv.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dlna.mpeg-tts": {
      source: "iana"
    },
    "video/vnd.dvb.file": {
      source: "iana",
      extensions: ["dvb"]
    },
    "video/vnd.fvt": {
      source: "iana",
      extensions: ["fvt"]
    },
    "video/vnd.hns.video": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.1dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-1010": {
      source: "iana"
    },
    "video/vnd.iptvforum.2dparityfec-2005": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsavc": {
      source: "iana"
    },
    "video/vnd.iptvforum.ttsmpeg2": {
      source: "iana"
    },
    "video/vnd.motorola.video": {
      source: "iana"
    },
    "video/vnd.motorola.videop": {
      source: "iana"
    },
    "video/vnd.mpegurl": {
      source: "iana",
      extensions: ["mxu", "m4u"]
    },
    "video/vnd.ms-playready.media.pyv": {
      source: "iana",
      extensions: ["pyv"]
    },
    "video/vnd.nokia.interleaved-multimedia": {
      source: "iana"
    },
    "video/vnd.nokia.mp4vr": {
      source: "iana"
    },
    "video/vnd.nokia.videovoip": {
      source: "iana"
    },
    "video/vnd.objectvideo": {
      source: "iana"
    },
    "video/vnd.radgamettools.bink": {
      source: "iana"
    },
    "video/vnd.radgamettools.smacker": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg1": {
      source: "iana"
    },
    "video/vnd.sealed.mpeg4": {
      source: "iana"
    },
    "video/vnd.sealed.swf": {
      source: "iana"
    },
    "video/vnd.sealedmedia.softseal.mov": {
      source: "iana"
    },
    "video/vnd.uvvu.mp4": {
      source: "iana",
      extensions: ["uvu", "uvvu"]
    },
    "video/vnd.vivo": {
      source: "iana",
      extensions: ["viv"]
    },
    "video/vnd.youtube.yt": {
      source: "iana"
    },
    "video/vp8": {
      source: "iana"
    },
    "video/vp9": {
      source: "iana"
    },
    "video/webm": {
      source: "apache",
      compressible: false,
      extensions: ["webm"]
    },
    "video/x-f4v": {
      source: "apache",
      extensions: ["f4v"]
    },
    "video/x-fli": {
      source: "apache",
      extensions: ["fli"]
    },
    "video/x-flv": {
      source: "apache",
      compressible: false,
      extensions: ["flv"]
    },
    "video/x-m4v": {
      source: "apache",
      extensions: ["m4v"]
    },
    "video/x-matroska": {
      source: "apache",
      compressible: false,
      extensions: ["mkv", "mk3d", "mks"]
    },
    "video/x-mng": {
      source: "apache",
      extensions: ["mng"]
    },
    "video/x-ms-asf": {
      source: "apache",
      extensions: ["asf", "asx"]
    },
    "video/x-ms-vob": {
      source: "apache",
      extensions: ["vob"]
    },
    "video/x-ms-wm": {
      source: "apache",
      extensions: ["wm"]
    },
    "video/x-ms-wmv": {
      source: "apache",
      compressible: false,
      extensions: ["wmv"]
    },
    "video/x-ms-wmx": {
      source: "apache",
      extensions: ["wmx"]
    },
    "video/x-ms-wvx": {
      source: "apache",
      extensions: ["wvx"]
    },
    "video/x-msvideo": {
      source: "apache",
      extensions: ["avi"]
    },
    "video/x-sgi-movie": {
      source: "apache",
      extensions: ["movie"]
    },
    "video/x-smv": {
      source: "apache",
      extensions: ["smv"]
    },
    "x-conference/x-cooltalk": {
      source: "apache",
      extensions: ["ice"]
    },
    "x-shader/x-fragment": {
      compressible: true
    },
    "x-shader/x-vertex": {
      compressible: true
    }
  };
});

// node_modules/mime-db/index.js
var require_mime_db = __commonJS((exports, module) => {
  /*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   */
  module.exports = require_db();
});

// node_modules/mime-types/index.js
var require_mime_types = __commonJS((exports) => {
  /*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   */
  var db = require_mime_db();
  var extname = __require("path").extname;
  var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  var TEXT_TYPE_REGEXP = /^text\//i;
  exports.charset = charset;
  exports.charsets = { lookup: charset };
  exports.contentType = contentType;
  exports.extension = extension;
  exports.extensions = Object.create(null);
  exports.lookup = lookup;
  exports.types = Object.create(null);
  populateMaps(exports.extensions, exports.types);
  function charset(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var mime = match && db[match[1].toLowerCase()];
    if (mime && mime.charset) {
      return mime.charset;
    }
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
      return "UTF-8";
    }
    return false;
  }
  function contentType(str) {
    if (!str || typeof str !== "string") {
      return false;
    }
    var mime = str.indexOf("/") === -1 ? exports.lookup(str) : str;
    if (!mime) {
      return false;
    }
    if (mime.indexOf("charset") === -1) {
      var charset2 = exports.charset(mime);
      if (charset2)
        mime += "; charset=" + charset2.toLowerCase();
    }
    return mime;
  }
  function extension(type) {
    if (!type || typeof type !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var exts = match && exports.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
      return false;
    }
    return exts[0];
  }
  function lookup(path) {
    if (!path || typeof path !== "string") {
      return false;
    }
    var extension2 = extname("x." + path).toLowerCase().substr(1);
    if (!extension2) {
      return false;
    }
    return exports.types[extension2] || false;
  }
  function populateMaps(extensions, types) {
    var preference = ["nginx", "apache", undefined, "iana"];
    Object.keys(db).forEach(function forEachMimeType(type) {
      var mime = db[type];
      var exts = mime.extensions;
      if (!exts || !exts.length) {
        return;
      }
      extensions[type] = exts;
      for (var i = 0;i < exts.length; i++) {
        var extension2 = exts[i];
        if (types[extension2]) {
          var from = preference.indexOf(db[types[extension2]].source);
          var to = preference.indexOf(mime.source);
          if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
            continue;
          }
        }
        types[extension2] = type;
      }
    });
  }
});

// node_modules/asynckit/lib/defer.js
var require_defer = __commonJS((exports, module) => {
  module.exports = defer;
  function defer(fn) {
    var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
    if (nextTick) {
      nextTick(fn);
    } else {
      setTimeout(fn, 0);
    }
  }
});

// node_modules/asynckit/lib/async.js
var require_async = __commonJS((exports, module) => {
  var defer = require_defer();
  module.exports = async;
  function async(callback) {
    var isAsync = false;
    defer(function() {
      isAsync = true;
    });
    return function async_callback(err, result) {
      if (isAsync) {
        callback(err, result);
      } else {
        defer(function nextTick_callback() {
          callback(err, result);
        });
      }
    };
  }
});

// node_modules/asynckit/lib/abort.js
var require_abort = __commonJS((exports, module) => {
  module.exports = abort;
  function abort(state) {
    Object.keys(state.jobs).forEach(clean.bind(state));
    state.jobs = {};
  }
  function clean(key) {
    if (typeof this.jobs[key] == "function") {
      this.jobs[key]();
    }
  }
});

// node_modules/asynckit/lib/iterate.js
var require_iterate = __commonJS((exports, module) => {
  var async = require_async();
  var abort = require_abort();
  module.exports = iterate;
  function iterate(list, iterator2, state, callback) {
    var key = state["keyedList"] ? state["keyedList"][state.index] : state.index;
    state.jobs[key] = runJob(iterator2, key, list[key], function(error, output) {
      if (!(key in state.jobs)) {
        return;
      }
      delete state.jobs[key];
      if (error) {
        abort(state);
      } else {
        state.results[key] = output;
      }
      callback(error, state.results);
    });
  }
  function runJob(iterator2, key, item, callback) {
    var aborter;
    if (iterator2.length == 2) {
      aborter = iterator2(item, async(callback));
    } else {
      aborter = iterator2(item, key, async(callback));
    }
    return aborter;
  }
});

// node_modules/asynckit/lib/state.js
var require_state = __commonJS((exports, module) => {
  module.exports = state;
  function state(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
      index: 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs: {},
      results: isNamedList ? {} : [],
      size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
      initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
        return sortMethod(list[a], list[b]);
      });
    }
    return initState;
  }
});

// node_modules/asynckit/lib/terminator.js
var require_terminator = __commonJS((exports, module) => {
  var abort = require_abort();
  var async = require_async();
  module.exports = terminator;
  function terminator(callback) {
    if (!Object.keys(this.jobs).length) {
      return;
    }
    this.index = this.size;
    abort(this);
    async(callback)(null, this.results);
  }
});

// node_modules/asynckit/parallel.js
var require_parallel = __commonJS((exports, module) => {
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = parallel;
  function parallel(list, iterator2, callback) {
    var state = initState(list);
    while (state.index < (state["keyedList"] || list).length) {
      iterate(list, iterator2, state, function(error, result) {
        if (error) {
          callback(error, result);
          return;
        }
        if (Object.keys(state.jobs).length === 0) {
          callback(null, state.results);
          return;
        }
      });
      state.index++;
    }
    return terminator.bind(state, callback);
  }
});

// node_modules/asynckit/serialOrdered.js
var require_serialOrdered = __commonJS((exports, module) => {
  var iterate = require_iterate();
  var initState = require_state();
  var terminator = require_terminator();
  module.exports = serialOrdered;
  module.exports.ascending = ascending;
  module.exports.descending = descending;
  function serialOrdered(list, iterator2, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator2, state, function iteratorHandler(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      state.index++;
      if (state.index < (state["keyedList"] || list).length) {
        iterate(list, iterator2, state, iteratorHandler);
        return;
      }
      callback(null, state.results);
    });
    return terminator.bind(state, callback);
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function descending(a, b) {
    return -1 * ascending(a, b);
  }
});

// node_modules/asynckit/serial.js
var require_serial = __commonJS((exports, module) => {
  var serialOrdered = require_serialOrdered();
  module.exports = serial;
  function serial(list, iterator2, callback) {
    return serialOrdered(list, iterator2, null, callback);
  }
});

// node_modules/asynckit/index.js
var require_asynckit = __commonJS((exports, module) => {
  module.exports = {
    parallel: require_parallel(),
    serial: require_serial(),
    serialOrdered: require_serialOrdered()
  };
});

// node_modules/es-object-atoms/index.js
var require_es_object_atoms = __commonJS((exports, module) => {
  module.exports = Object;
});

// node_modules/es-errors/index.js
var require_es_errors = __commonJS((exports, module) => {
  module.exports = Error;
});

// node_modules/es-errors/eval.js
var require_eval = __commonJS((exports, module) => {
  module.exports = EvalError;
});

// node_modules/es-errors/range.js
var require_range = __commonJS((exports, module) => {
  module.exports = RangeError;
});

// node_modules/es-errors/ref.js
var require_ref = __commonJS((exports, module) => {
  module.exports = ReferenceError;
});

// node_modules/es-errors/syntax.js
var require_syntax = __commonJS((exports, module) => {
  module.exports = SyntaxError;
});

// node_modules/es-errors/type.js
var require_type = __commonJS((exports, module) => {
  module.exports = TypeError;
});

// node_modules/es-errors/uri.js
var require_uri = __commonJS((exports, module) => {
  module.exports = URIError;
});

// node_modules/math-intrinsics/abs.js
var require_abs = __commonJS((exports, module) => {
  module.exports = Math.abs;
});

// node_modules/math-intrinsics/floor.js
var require_floor = __commonJS((exports, module) => {
  module.exports = Math.floor;
});

// node_modules/math-intrinsics/max.js
var require_max = __commonJS((exports, module) => {
  module.exports = Math.max;
});

// node_modules/math-intrinsics/min.js
var require_min = __commonJS((exports, module) => {
  module.exports = Math.min;
});

// node_modules/math-intrinsics/pow.js
var require_pow = __commonJS((exports, module) => {
  module.exports = Math.pow;
});

// node_modules/math-intrinsics/round.js
var require_round = __commonJS((exports, module) => {
  module.exports = Math.round;
});

// node_modules/math-intrinsics/isNaN.js
var require_isNaN = __commonJS((exports, module) => {
  module.exports = Number.isNaN || function isNaN(a) {
    return a !== a;
  };
});

// node_modules/math-intrinsics/sign.js
var require_sign = __commonJS((exports, module) => {
  var $isNaN = require_isNaN();
  module.exports = function sign(number) {
    if ($isNaN(number) || number === 0) {
      return number;
    }
    return number < 0 ? -1 : 1;
  };
});

// node_modules/gopd/gOPD.js
var require_gOPD = __commonJS((exports, module) => {
  module.exports = Object.getOwnPropertyDescriptor;
});

// node_modules/gopd/index.js
var require_gopd = __commonJS((exports, module) => {
  var $gOPD = require_gOPD();
  if ($gOPD) {
    try {
      $gOPD([], "length");
    } catch (e) {
      $gOPD = null;
    }
  }
  module.exports = $gOPD;
});

// node_modules/es-define-property/index.js
var require_es_define_property = __commonJS((exports, module) => {
  var $defineProperty = Object.defineProperty || false;
  if ($defineProperty) {
    try {
      $defineProperty({}, "a", { value: 1 });
    } catch (e) {
      $defineProperty = false;
    }
  }
  module.exports = $defineProperty;
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS((exports, module) => {
  module.exports = function hasSymbols() {
    if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
      return false;
    }
    if (typeof Symbol.iterator === "symbol") {
      return true;
    }
    var obj = {};
    var sym = Symbol("test");
    var symObj = Object(sym);
    if (typeof sym === "string") {
      return false;
    }
    if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
      return false;
    }
    if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
      return false;
    }
    var symVal = 42;
    obj[sym] = symVal;
    for (var _ in obj) {
      return false;
    }
    if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
      return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === "function") {
      var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
      if (descriptor.value !== symVal || descriptor.enumerable !== true) {
        return false;
      }
    }
    return true;
  };
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS((exports, module) => {
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = require_shams();
  module.exports = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
});

// node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = __commonJS((exports, module) => {
  module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
});

// node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = __commonJS((exports, module) => {
  var $Object = require_es_object_atoms();
  module.exports = $Object.getPrototypeOf || null;
});

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS((exports, module) => {
  var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
  var toStr = Object.prototype.toString;
  var max = Math.max;
  var funcType = "[object Function]";
  var concatty = function concatty(a, b) {
    var arr = [];
    for (var i = 0;i < a.length; i += 1) {
      arr[i] = a[i];
    }
    for (var j = 0;j < b.length; j += 1) {
      arr[j + a.length] = b[j];
    }
    return arr;
  };
  var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0;i < arrLike.length; i += 1, j += 1) {
      arr[j] = arrLike[i];
    }
    return arr;
  };
  var joiny = function(arr, joiner) {
    var str = "";
    for (var i = 0;i < arr.length; i += 1) {
      str += arr[i];
      if (i + 1 < arr.length) {
        str += joiner;
      }
    }
    return str;
  };
  module.exports = function bind(that) {
    var target = this;
    if (typeof target !== "function" || toStr.apply(target) !== funcType) {
      throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
      if (this instanceof bound) {
        var result = target.apply(this, concatty(args, arguments));
        if (Object(result) === result) {
          return result;
        }
        return this;
      }
      return target.apply(that, concatty(args, arguments));
    };
    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0;i < boundLength; i++) {
      boundArgs[i] = "$" + i;
    }
    bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
    if (target.prototype) {
      var Empty = function Empty() {};
      Empty.prototype = target.prototype;
      bound.prototype = new Empty;
      Empty.prototype = null;
    }
    return bound;
  };
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS((exports, module) => {
  var implementation = require_implementation();
  module.exports = Function.prototype.bind || implementation;
});

// node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = __commonJS((exports, module) => {
  module.exports = Function.prototype.call;
});

// node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = __commonJS((exports, module) => {
  module.exports = Function.prototype.apply;
});

// node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = __commonJS((exports, module) => {
  module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
});

// node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = __commonJS((exports, module) => {
  var bind2 = require_function_bind();
  var $apply = require_functionApply();
  var $call = require_functionCall();
  var $reflectApply = require_reflectApply();
  module.exports = $reflectApply || bind2.call($call, $apply);
});

// node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = __commonJS((exports, module) => {
  var bind2 = require_function_bind();
  var $TypeError = require_type();
  var $call = require_functionCall();
  var $actualApply = require_actualApply();
  module.exports = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== "function") {
      throw new $TypeError("a function is required");
    }
    return $actualApply(bind2, $call, args);
  };
});

// node_modules/dunder-proto/get.js
var require_get = __commonJS((exports, module) => {
  var callBind = require_call_bind_apply_helpers();
  var gOPD = require_gopd();
  var hasProtoAccessor;
  try {
    hasProtoAccessor = [].__proto__ === Array.prototype;
  } catch (e) {
    if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
      throw e;
    }
  }
  var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, "__proto__");
  var $Object = Object;
  var $getPrototypeOf = $Object.getPrototypeOf;
  module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? function getDunder(value) {
    return $getPrototypeOf(value == null ? value : $Object(value));
  } : false;
});

// node_modules/get-proto/index.js
var require_get_proto = __commonJS((exports, module) => {
  var reflectGetProto = require_Reflect_getPrototypeOf();
  var originalGetProto = require_Object_getPrototypeOf();
  var getDunderProto = require_get();
  module.exports = reflectGetProto ? function getProto(O) {
    return reflectGetProto(O);
  } : originalGetProto ? function getProto(O) {
    if (!O || typeof O !== "object" && typeof O !== "function") {
      throw new TypeError("getProto: not an object");
    }
    return originalGetProto(O);
  } : getDunderProto ? function getProto(O) {
    return getDunderProto(O);
  } : null;
});

// node_modules/hasown/index.js
var require_hasown = __commonJS((exports, module) => {
  var call = Function.prototype.call;
  var $hasOwn = Object.prototype.hasOwnProperty;
  var bind2 = require_function_bind();
  module.exports = bind2.call(call, $hasOwn);
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS((exports, module) => {
  var undefined2;
  var $Object = require_es_object_atoms();
  var $Error = require_es_errors();
  var $EvalError = require_eval();
  var $RangeError = require_range();
  var $ReferenceError = require_ref();
  var $SyntaxError = require_syntax();
  var $TypeError = require_type();
  var $URIError = require_uri();
  var abs = require_abs();
  var floor = require_floor();
  var max = require_max();
  var min = require_min();
  var pow = require_pow();
  var round = require_round();
  var sign = require_sign();
  var $Function = Function;
  var getEvalledConstructor = function(expressionSyntax) {
    try {
      return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
    } catch (e) {}
  };
  var $gOPD = require_gopd();
  var $defineProperty = require_es_define_property();
  var throwTypeError = function() {
    throw new $TypeError;
  };
  var ThrowTypeError = $gOPD ? function() {
    try {
      arguments.callee;
      return throwTypeError;
    } catch (calleeThrows) {
      try {
        return $gOPD(arguments, "callee").get;
      } catch (gOPDthrows) {
        return throwTypeError;
      }
    }
  }() : throwTypeError;
  var hasSymbols = require_has_symbols()();
  var getProto = require_get_proto();
  var $ObjectGPO = require_Object_getPrototypeOf();
  var $ReflectGPO = require_Reflect_getPrototypeOf();
  var $apply = require_functionApply();
  var $call = require_functionCall();
  var needsEval = {};
  var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
  var INTRINSICS = {
    __proto__: null,
    "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
    "%Array%": Array,
    "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
    "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
    "%AsyncFromSyncIteratorPrototype%": undefined2,
    "%AsyncFunction%": needsEval,
    "%AsyncGenerator%": needsEval,
    "%AsyncGeneratorFunction%": needsEval,
    "%AsyncIteratorPrototype%": needsEval,
    "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
    "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
    "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
    "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
    "%Boolean%": Boolean,
    "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
    "%Date%": Date,
    "%decodeURI%": decodeURI,
    "%decodeURIComponent%": decodeURIComponent,
    "%encodeURI%": encodeURI,
    "%encodeURIComponent%": encodeURIComponent,
    "%Error%": $Error,
    "%eval%": eval,
    "%EvalError%": $EvalError,
    "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
    "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
    "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
    "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
    "%Function%": $Function,
    "%GeneratorFunction%": needsEval,
    "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
    "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
    "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
    "%isFinite%": isFinite,
    "%isNaN%": isNaN,
    "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
    "%JSON%": typeof JSON === "object" ? JSON : undefined2,
    "%Map%": typeof Map === "undefined" ? undefined2 : Map,
    "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto(new Map()[Symbol.iterator]()),
    "%Math%": Math,
    "%Number%": Number,
    "%Object%": $Object,
    "%Object.getOwnPropertyDescriptor%": $gOPD,
    "%parseFloat%": parseFloat,
    "%parseInt%": parseInt,
    "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
    "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
    "%RangeError%": $RangeError,
    "%ReferenceError%": $ReferenceError,
    "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
    "%RegExp%": RegExp,
    "%Set%": typeof Set === "undefined" ? undefined2 : Set,
    "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto(new Set()[Symbol.iterator]()),
    "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
    "%String%": String,
    "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
    "%Symbol%": hasSymbols ? Symbol : undefined2,
    "%SyntaxError%": $SyntaxError,
    "%ThrowTypeError%": ThrowTypeError,
    "%TypedArray%": TypedArray,
    "%TypeError%": $TypeError,
    "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
    "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
    "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
    "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
    "%URIError%": $URIError,
    "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
    "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
    "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
    "%Function.prototype.call%": $call,
    "%Function.prototype.apply%": $apply,
    "%Object.defineProperty%": $defineProperty,
    "%Object.getPrototypeOf%": $ObjectGPO,
    "%Math.abs%": abs,
    "%Math.floor%": floor,
    "%Math.max%": max,
    "%Math.min%": min,
    "%Math.pow%": pow,
    "%Math.round%": round,
    "%Math.sign%": sign,
    "%Reflect.getPrototypeOf%": $ReflectGPO
  };
  if (getProto) {
    try {
      null.error;
    } catch (e) {
      errorProto = getProto(getProto(e));
      INTRINSICS["%Error.prototype%"] = errorProto;
    }
  }
  var errorProto;
  var doEval = function doEval(name) {
    var value;
    if (name === "%AsyncFunction%") {
      value = getEvalledConstructor("async function () {}");
    } else if (name === "%GeneratorFunction%") {
      value = getEvalledConstructor("function* () {}");
    } else if (name === "%AsyncGeneratorFunction%") {
      value = getEvalledConstructor("async function* () {}");
    } else if (name === "%AsyncGenerator%") {
      var fn = doEval("%AsyncGeneratorFunction%");
      if (fn) {
        value = fn.prototype;
      }
    } else if (name === "%AsyncIteratorPrototype%") {
      var gen = doEval("%AsyncGenerator%");
      if (gen && getProto) {
        value = getProto(gen.prototype);
      }
    }
    INTRINSICS[name] = value;
    return value;
  };
  var LEGACY_ALIASES = {
    __proto__: null,
    "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
    "%ArrayPrototype%": ["Array", "prototype"],
    "%ArrayProto_entries%": ["Array", "prototype", "entries"],
    "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
    "%ArrayProto_keys%": ["Array", "prototype", "keys"],
    "%ArrayProto_values%": ["Array", "prototype", "values"],
    "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
    "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
    "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
    "%BooleanPrototype%": ["Boolean", "prototype"],
    "%DataViewPrototype%": ["DataView", "prototype"],
    "%DatePrototype%": ["Date", "prototype"],
    "%ErrorPrototype%": ["Error", "prototype"],
    "%EvalErrorPrototype%": ["EvalError", "prototype"],
    "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
    "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
    "%FunctionPrototype%": ["Function", "prototype"],
    "%Generator%": ["GeneratorFunction", "prototype"],
    "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
    "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
    "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
    "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
    "%JSONParse%": ["JSON", "parse"],
    "%JSONStringify%": ["JSON", "stringify"],
    "%MapPrototype%": ["Map", "prototype"],
    "%NumberPrototype%": ["Number", "prototype"],
    "%ObjectPrototype%": ["Object", "prototype"],
    "%ObjProto_toString%": ["Object", "prototype", "toString"],
    "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
    "%PromisePrototype%": ["Promise", "prototype"],
    "%PromiseProto_then%": ["Promise", "prototype", "then"],
    "%Promise_all%": ["Promise", "all"],
    "%Promise_reject%": ["Promise", "reject"],
    "%Promise_resolve%": ["Promise", "resolve"],
    "%RangeErrorPrototype%": ["RangeError", "prototype"],
    "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
    "%RegExpPrototype%": ["RegExp", "prototype"],
    "%SetPrototype%": ["Set", "prototype"],
    "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
    "%StringPrototype%": ["String", "prototype"],
    "%SymbolPrototype%": ["Symbol", "prototype"],
    "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
    "%TypedArrayPrototype%": ["TypedArray", "prototype"],
    "%TypeErrorPrototype%": ["TypeError", "prototype"],
    "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
    "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
    "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
    "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
    "%URIErrorPrototype%": ["URIError", "prototype"],
    "%WeakMapPrototype%": ["WeakMap", "prototype"],
    "%WeakSetPrototype%": ["WeakSet", "prototype"]
  };
  var bind2 = require_function_bind();
  var hasOwn = require_hasown();
  var $concat = bind2.call($call, Array.prototype.concat);
  var $spliceApply = bind2.call($apply, Array.prototype.splice);
  var $replace = bind2.call($call, String.prototype.replace);
  var $strSlice = bind2.call($call, String.prototype.slice);
  var $exec = bind2.call($call, RegExp.prototype.exec);
  var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = function stringToPath(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === "%" && last !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
    } else if (last === "%" && first !== "%") {
      throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
    }
    var result = [];
    $replace(string, rePropName, function(match, number, quote, subString) {
      result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
    });
    return result;
  };
  var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
      alias = LEGACY_ALIASES[intrinsicName];
      intrinsicName = "%" + alias[0] + "%";
    }
    if (hasOwn(INTRINSICS, intrinsicName)) {
      var value = INTRINSICS[intrinsicName];
      if (value === needsEval) {
        value = doEval(intrinsicName);
      }
      if (typeof value === "undefined" && !allowMissing) {
        throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
      }
      return {
        alias,
        name: intrinsicName,
        value
      };
    }
    throw new $SyntaxError("intrinsic " + name + " does not exist!");
  };
  module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== "string" || name.length === 0) {
      throw new $TypeError("intrinsic name must be a non-empty string");
    }
    if (arguments.length > 1 && typeof allowMissing !== "boolean") {
      throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
      throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
    var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
    var intrinsicRealName = intrinsic.name;
    var value = intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic.alias;
    if (alias) {
      intrinsicBaseName = alias[0];
      $spliceApply(parts, $concat([0, 1], alias));
    }
    for (var i = 1, isOwn = true;i < parts.length; i += 1) {
      var part = parts[i];
      var first = $strSlice(part, 0, 1);
      var last = $strSlice(part, -1);
      if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
        throw new $SyntaxError("property names with quotes must have matching quotes");
      }
      if (part === "constructor" || !isOwn) {
        skipFurtherCaching = true;
      }
      intrinsicBaseName += "." + part;
      intrinsicRealName = "%" + intrinsicBaseName + "%";
      if (hasOwn(INTRINSICS, intrinsicRealName)) {
        value = INTRINSICS[intrinsicRealName];
      } else if (value != null) {
        if (!(part in value)) {
          if (!allowMissing) {
            throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
          }
          return;
        }
        if ($gOPD && i + 1 >= parts.length) {
          var desc = $gOPD(value, part);
          isOwn = !!desc;
          if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
            value = desc.get;
          } else {
            value = value[part];
          }
        } else {
          isOwn = hasOwn(value, part);
          value = value[part];
        }
        if (isOwn && !skipFurtherCaching) {
          INTRINSICS[intrinsicRealName] = value;
        }
      }
    }
    return value;
  };
});

// node_modules/has-tostringtag/shams.js
var require_shams2 = __commonJS((exports, module) => {
  var hasSymbols = require_shams();
  module.exports = function hasToStringTagShams() {
    return hasSymbols() && !!Symbol.toStringTag;
  };
});

// node_modules/es-set-tostringtag/index.js
var require_es_set_tostringtag = __commonJS((exports, module) => {
  var GetIntrinsic = require_get_intrinsic();
  var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
  var hasToStringTag = require_shams2()();
  var hasOwn = require_hasown();
  var $TypeError = require_type();
  var toStringTag2 = hasToStringTag ? Symbol.toStringTag : null;
  module.exports = function setToStringTag(object, value) {
    var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
    var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
    if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") {
      throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
    }
    if (toStringTag2 && (overrideIfSet || !hasOwn(object, toStringTag2))) {
      if ($defineProperty) {
        $defineProperty(object, toStringTag2, {
          configurable: !nonConfigurable,
          enumerable: false,
          value,
          writable: false
        });
      } else {
        object[toStringTag2] = value;
      }
    }
  };
});

// node_modules/form-data/lib/populate.js
var require_populate = __commonJS((exports, module) => {
  module.exports = function(dst, src) {
    Object.keys(src).forEach(function(prop) {
      dst[prop] = dst[prop] || src[prop];
    });
    return dst;
  };
});

// node_modules/form-data/lib/form_data.js
var require_form_data = __commonJS((exports, module) => {
  var CombinedStream = require_combined_stream();
  var util = __require("util");
  var path = __require("path");
  var http = __require("http");
  var https = __require("https");
  var parseUrl = __require("url").parse;
  var fs = __require("fs");
  var Stream = __require("stream").Stream;
  var crypto = __require("crypto");
  var mime = require_mime_types();
  var asynckit = require_asynckit();
  var setToStringTag = require_es_set_tostringtag();
  var hasOwn = require_hasown();
  var populate = require_populate();
  function FormData2(options) {
    if (!(this instanceof FormData2)) {
      return new FormData2(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {};
    for (var option in options) {
      this[option] = options[option];
    }
  }
  util.inherits(FormData2, CombinedStream);
  FormData2.LINE_BREAK = `\r
`;
  FormData2.DEFAULT_CONTENT_TYPE = "application/octet-stream";
  FormData2.prototype.append = function(field, value, options) {
    options = options || {};
    if (typeof options === "string") {
      options = { filename: options };
    }
    var append = CombinedStream.prototype.append.bind(this);
    if (typeof value === "number" || value == null) {
      value = String(value);
    }
    if (Array.isArray(value)) {
      this._error(new Error("Arrays are not supported."));
      return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append(header);
    append(value);
    append(footer);
    this._trackLength(header, value, options);
  };
  FormData2.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    if (options.knownLength != null) {
      valueLength += Number(options.knownLength);
    } else if (Buffer.isBuffer(value)) {
      valueLength = value.length;
    } else if (typeof value === "string") {
      valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    this._overheadLength += Buffer.byteLength(header) + FormData2.LINE_BREAK.length;
    if (!value || !value.path && !(value.readable && hasOwn(value, "httpVersion")) && !(value instanceof Stream)) {
      return;
    }
    if (!options.knownLength) {
      this._valuesToMeasure.push(value);
    }
  };
  FormData2.prototype._lengthRetriever = function(value, callback) {
    if (hasOwn(value, "fd")) {
      if (value.end != null && value.end != Infinity && value.start != null) {
        callback(null, value.end + 1 - (value.start ? value.start : 0));
      } else {
        fs.stat(value.path, function(err, stat) {
          if (err) {
            callback(err);
            return;
          }
          var fileSize = stat.size - (value.start ? value.start : 0);
          callback(null, fileSize);
        });
      }
    } else if (hasOwn(value, "httpVersion")) {
      callback(null, Number(value.headers["content-length"]));
    } else if (hasOwn(value, "httpModule")) {
      value.on("response", function(response) {
        value.pause();
        callback(null, Number(response.headers["content-length"]));
      });
      value.resume();
    } else {
      callback("Unknown stream");
    }
  };
  FormData2.prototype._multiPartHeader = function(field, value, options) {
    if (typeof options.header === "string") {
      return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = "";
    var headers = {
      "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
      "Content-Type": [].concat(contentType || [])
    };
    if (typeof options.header === "object") {
      populate(headers, options.header);
    }
    var header;
    for (var prop in headers) {
      if (hasOwn(headers, prop)) {
        header = headers[prop];
        if (header == null) {
          continue;
        }
        if (!Array.isArray(header)) {
          header = [header];
        }
        if (header.length) {
          contents += prop + ": " + header.join("; ") + FormData2.LINE_BREAK;
        }
      }
    }
    return "--" + this.getBoundary() + FormData2.LINE_BREAK + contents + FormData2.LINE_BREAK;
  };
  FormData2.prototype._getContentDisposition = function(value, options) {
    var filename;
    if (typeof options.filepath === "string") {
      filename = path.normalize(options.filepath).replace(/\\/g, "/");
    } else if (options.filename || value && (value.name || value.path)) {
      filename = path.basename(options.filename || value && (value.name || value.path));
    } else if (value && value.readable && hasOwn(value, "httpVersion")) {
      filename = path.basename(value.client._httpMessage.path || "");
    }
    if (filename) {
      return 'filename="' + filename + '"';
    }
  };
  FormData2.prototype._getContentType = function(value, options) {
    var contentType = options.contentType;
    if (!contentType && value && value.name) {
      contentType = mime.lookup(value.name);
    }
    if (!contentType && value && value.path) {
      contentType = mime.lookup(value.path);
    }
    if (!contentType && value && value.readable && hasOwn(value, "httpVersion")) {
      contentType = value.headers["content-type"];
    }
    if (!contentType && (options.filepath || options.filename)) {
      contentType = mime.lookup(options.filepath || options.filename);
    }
    if (!contentType && value && typeof value === "object") {
      contentType = FormData2.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
  };
  FormData2.prototype._multiPartFooter = function() {
    return function(next) {
      var footer = FormData2.LINE_BREAK;
      var lastPart = this._streams.length === 0;
      if (lastPart) {
        footer += this._lastBoundary();
      }
      next(footer);
    }.bind(this);
  };
  FormData2.prototype._lastBoundary = function() {
    return "--" + this.getBoundary() + "--" + FormData2.LINE_BREAK;
  };
  FormData2.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
      "content-type": "multipart/form-data; boundary=" + this.getBoundary()
    };
    for (header in userHeaders) {
      if (hasOwn(userHeaders, header)) {
        formHeaders[header.toLowerCase()] = userHeaders[header];
      }
    }
    return formHeaders;
  };
  FormData2.prototype.setBoundary = function(boundary) {
    if (typeof boundary !== "string") {
      throw new TypeError("FormData boundary must be a string");
    }
    this._boundary = boundary;
  };
  FormData2.prototype.getBoundary = function() {
    if (!this._boundary) {
      this._generateBoundary();
    }
    return this._boundary;
  };
  FormData2.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0);
    var boundary = this.getBoundary();
    for (var i = 0, len = this._streams.length;i < len; i++) {
      if (typeof this._streams[i] !== "function") {
        if (Buffer.isBuffer(this._streams[i])) {
          dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
        } else {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
        }
        if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
          dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData2.LINE_BREAK)]);
        }
      }
    }
    return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
  };
  FormData2.prototype._generateBoundary = function() {
    this._boundary = "--------------------------" + crypto.randomBytes(12).toString("hex");
  };
  FormData2.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this.hasKnownLength()) {
      this._error(new Error("Cannot calculate proper length in synchronous way."));
    }
    return knownLength;
  };
  FormData2.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
      hasKnownLength = false;
    }
    return hasKnownLength;
  };
  FormData2.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
      knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
      process.nextTick(cb.bind(this, null, knownLength));
      return;
    }
    asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
      if (err) {
        cb(err);
        return;
      }
      values.forEach(function(length) {
        knownLength += length;
      });
      cb(null, knownLength);
    });
  };
  FormData2.prototype.submit = function(params, cb) {
    var request;
    var options;
    var defaults = { method: "post" };
    if (typeof params === "string") {
      params = parseUrl(params);
      options = populate({
        port: params.port,
        path: params.pathname,
        host: params.hostname,
        protocol: params.protocol
      }, defaults);
    } else {
      options = populate(params, defaults);
      if (!options.port) {
        options.port = options.protocol === "https:" ? 443 : 80;
      }
    }
    options.headers = this.getHeaders(params.headers);
    if (options.protocol === "https:") {
      request = https.request(options);
    } else {
      request = http.request(options);
    }
    this.getLength(function(err, length) {
      if (err && err !== "Unknown stream") {
        this._error(err);
        return;
      }
      if (length) {
        request.setHeader("Content-Length", length);
      }
      this.pipe(request);
      if (cb) {
        var onResponse;
        var callback = function(error, responce) {
          request.removeListener("error", callback);
          request.removeListener("response", onResponse);
          return cb.call(this, error, responce);
        };
        onResponse = callback.bind(this, null);
        request.on("error", callback);
        request.on("response", onResponse);
      }
    }.bind(this));
    return request;
  };
  FormData2.prototype._error = function(err) {
    if (!this.error) {
      this.error = err;
      this.pause();
      this.emit("error", err);
    }
  };
  FormData2.prototype.toString = function() {
    return "[object FormData]";
  };
  setToStringTag(FormData2, "FormData");
  module.exports = FormData2;
});

// node_modules/proxy-from-env/index.js
var require_proxy_from_env = __commonJS((exports) => {
  var parseUrl = __require("url").parse;
  var DEFAULT_PORTS = {
    ftp: 21,
    gopher: 70,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
  };
  var stringEndsWith = String.prototype.endsWith || function(s) {
    return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
  };
  function getProxyForUrl(url2) {
    var parsedUrl = typeof url2 === "string" ? parseUrl(url2) : url2 || {};
    var proto = parsedUrl.protocol;
    var hostname = parsedUrl.host;
    var port = parsedUrl.port;
    if (typeof hostname !== "string" || !hostname || typeof proto !== "string") {
      return "";
    }
    proto = proto.split(":", 1)[0];
    hostname = hostname.replace(/:\d*$/, "");
    port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
    if (!shouldProxy(hostname, port)) {
      return "";
    }
    var proxy = getEnv("npm_config_" + proto + "_proxy") || getEnv(proto + "_proxy") || getEnv("npm_config_proxy") || getEnv("all_proxy");
    if (proxy && proxy.indexOf("://") === -1) {
      proxy = proto + "://" + proxy;
    }
    return proxy;
  }
  function shouldProxy(hostname, port) {
    var NO_PROXY = (getEnv("npm_config_no_proxy") || getEnv("no_proxy")).toLowerCase();
    if (!NO_PROXY) {
      return true;
    }
    if (NO_PROXY === "*") {
      return false;
    }
    return NO_PROXY.split(/[,\s]/).every(function(proxy) {
      if (!proxy) {
        return true;
      }
      var parsedProxy = proxy.match(/^(.+):(\d+)$/);
      var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
      var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
      if (parsedProxyPort && parsedProxyPort !== port) {
        return true;
      }
      if (!/^[.*]/.test(parsedProxyHostname)) {
        return hostname !== parsedProxyHostname;
      }
      if (parsedProxyHostname.charAt(0) === "*") {
        parsedProxyHostname = parsedProxyHostname.slice(1);
      }
      return !stringEndsWith.call(hostname, parsedProxyHostname);
    });
  }
  function getEnv(key) {
    return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || "";
  }
  exports.getProxyForUrl = getProxyForUrl;
});

// node_modules/ms/index.js
var require_ms = __commonJS((exports, module) => {
  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return;
    }
  }
  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + "s";
    }
    return ms + "ms";
  }
  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, "second");
    }
    return ms + " ms";
  }
  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS((exports, module) => {
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = require_ms();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0;i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug(...args) {
        if (!debug.enabled) {
          return;
        }
        const self2 = debug;
        const curr = Number(new Date);
        const ms = curr - (prevTime || curr);
        self2.diff = ms;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug.namespace = namespace;
      debug.useColors = createDebug.useColors();
      debug.color = createDebug.selectColor(namespace);
      debug.extend = extend2;
      debug.destroy = createDebug.destroy;
      Object.defineProperty(debug, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug);
      }
      return debug;
    }
    function extend2(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  module.exports = setup;
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS((exports, module) => {
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
    let warned = false;
    return () => {
      if (!warned) {
        warned = true;
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
    };
  })();
  exports.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function useColors() {
    if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
      return true;
    }
    if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
      return false;
    }
    let m;
    return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function formatArgs(args) {
    args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
    if (!this.useColors) {
      return;
    }
    const c = "color: " + this.color;
    args.splice(1, 0, c, "color: inherit");
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match) => {
      if (match === "%%") {
        return;
      }
      index++;
      if (match === "%c") {
        lastC = index;
      }
    });
    args.splice(lastC, 0, c);
  }
  exports.log = console.debug || console.log || (() => {});
  function save(namespaces) {
    try {
      if (namespaces) {
        exports.storage.setItem("debug", namespaces);
      } else {
        exports.storage.removeItem("debug");
      }
    } catch (error) {}
  }
  function load() {
    let r;
    try {
      r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
    } catch (error) {}
    if (!r && typeof process !== "undefined" && "env" in process) {
      r = process.env.DEBUG;
    }
    return r;
  }
  function localstorage() {
    try {
      return localStorage;
    } catch (error) {}
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.j = function(v) {
    try {
      return JSON.stringify(v);
    } catch (error) {
      return "[UnexpectedJSONParseError]: " + error.message;
    }
  };
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS((exports, module) => {
  module.exports = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS((exports, module) => {
  var os = __require("os");
  var tty = __require("tty");
  var hasFlag = require_has_flag();
  var { env } = process;
  var forceColor;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
    forceColor = 0;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
      return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => (sign in env)) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  }
  module.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
});

// node_modules/debug/src/node.js
var require_node = __commonJS((exports, module) => {
  var tty = __require("tty");
  var util = __require("util");
  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.destroy = util.deprecate(() => {}, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  exports.colors = [6, 2, 3, 4, 5, 1];
  try {
    const supportsColor = require_supports_color();
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
      exports.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ];
    }
  } catch (error) {}
  exports.inspectOpts = Object.keys(process.env).filter((key) => {
    return /^debug_/i.test(key);
  }).reduce((obj, key) => {
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
      return k.toUpperCase();
    });
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === "null") {
      val = null;
    } else {
      val = Number(val);
    }
    obj[prop] = val;
    return obj;
  }, {});
  function useColors() {
    return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
  }
  function formatArgs(args) {
    const { namespace: name, useColors: useColors2 } = this;
    if (useColors2) {
      const c = this.color;
      const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
      const prefix = `  ${colorCode};1m${name} \x1B[0m`;
      args[0] = prefix + args[0].split(`
`).join(`
` + prefix);
      args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
    } else {
      args[0] = getDate() + name + " " + args[0];
    }
  }
  function getDate() {
    if (exports.inspectOpts.hideDate) {
      return "";
    }
    return new Date().toISOString() + " ";
  }
  function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + `
`);
  }
  function save(namespaces) {
    if (namespaces) {
      process.env.DEBUG = namespaces;
    } else {
      delete process.env.DEBUG;
    }
  }
  function load() {
    return process.env.DEBUG;
  }
  function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for (let i = 0;i < keys.length; i++) {
      debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
  }
  module.exports = require_common()(exports);
  var { formatters } = module.exports;
  formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split(`
`).map((str) => str.trim()).join(" ");
  };
  formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
  };
});

// node_modules/debug/src/index.js
var require_src = __commonJS((exports, module) => {
  if (typeof process === "undefined" || process.type === "renderer" || false || process.__nwjs) {
    module.exports = require_browser();
  } else {
    module.exports = require_node();
  }
});

// node_modules/follow-redirects/debug.js
var require_debug = __commonJS((exports, module) => {
  var debug;
  module.exports = function() {
    if (!debug) {
      try {
        debug = require_src()("follow-redirects");
      } catch (error) {}
      if (typeof debug !== "function") {
        debug = function() {};
      }
    }
    debug.apply(null, arguments);
  };
});

// node_modules/follow-redirects/index.js
var require_follow_redirects = __commonJS((exports, module) => {
  var url2 = __require("url");
  var URL2 = url2.URL;
  var http = __require("http");
  var https = __require("https");
  var Writable = __require("stream").Writable;
  var assert = __require("assert");
  var debug = require_debug();
  (function detectUnsupportedEnvironment() {
    var looksLikeNode = typeof process !== "undefined";
    var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    var looksLikeV8 = isFunction2(Error.captureStackTrace);
    if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
      console.warn("The follow-redirects package should be excluded from browser builds.");
    }
  })();
  var useNativeURL = false;
  try {
    assert(new URL2(""));
  } catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
  }
  var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
  ];
  var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
  var eventHandlers = Object.create(null);
  events.forEach(function(event) {
    eventHandlers[event] = function(arg1, arg2, arg3) {
      this._redirectable.emit(event, arg1, arg2, arg3);
    };
  });
  var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
  var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
  var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
  var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
  var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  var destroy = Writable.prototype.destroy || noop2;
  function RedirectableRequest(options, responseCallback) {
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    if (responseCallback) {
      this.on("response", responseCallback);
    }
    var self2 = this;
    this._onNativeResponse = function(response) {
      try {
        self2._processResponse(response);
      } catch (cause) {
        self2.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
      }
    };
    this._performRequest();
  }
  RedirectableRequest.prototype = Object.create(Writable.prototype);
  RedirectableRequest.prototype.abort = function() {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
  };
  RedirectableRequest.prototype.destroy = function(error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
  };
  RedirectableRequest.prototype.write = function(data, encoding, callback) {
    if (this._ending) {
      throw new WriteAfterEndError;
    }
    if (!isString2(data) && !isBuffer2(data)) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (data.length === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data, encoding });
      this._currentRequest.write(data, encoding, callback);
    } else {
      this.emit("error", new MaxBodyLengthExceededError);
      this.abort();
    }
  };
  RedirectableRequest.prototype.end = function(data, encoding, callback) {
    if (isFunction2(data)) {
      callback = data;
      data = encoding = null;
    } else if (isFunction2(encoding)) {
      callback = encoding;
      encoding = null;
    }
    if (!data) {
      this._ended = this._ending = true;
      this._currentRequest.end(null, null, callback);
    } else {
      var self2 = this;
      var currentRequest = this._currentRequest;
      this.write(data, encoding, function() {
        self2._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  };
  RedirectableRequest.prototype.setHeader = function(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  };
  RedirectableRequest.prototype.removeHeader = function(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  };
  RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
    var self2 = this;
    function destroyOnTimeout(socket) {
      socket.setTimeout(msecs);
      socket.removeListener("timeout", socket.destroy);
      socket.addListener("timeout", socket.destroy);
    }
    function startTimer(socket) {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
      }
      self2._timeout = setTimeout(function() {
        self2.emit("timeout");
        clearTimer();
      }, msecs);
      destroyOnTimeout(socket);
    }
    function clearTimer() {
      if (self2._timeout) {
        clearTimeout(self2._timeout);
        self2._timeout = null;
      }
      self2.removeListener("abort", clearTimer);
      self2.removeListener("error", clearTimer);
      self2.removeListener("response", clearTimer);
      self2.removeListener("close", clearTimer);
      if (callback) {
        self2.removeListener("timeout", callback);
      }
      if (!self2.socket) {
        self2._currentRequest.removeListener("socket", startTimer);
      }
    }
    if (callback) {
      this.on("timeout", callback);
    }
    if (this.socket) {
      startTimer(this.socket);
    } else {
      this._currentRequest.once("socket", startTimer);
    }
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);
    return this;
  };
  [
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
  ].forEach(function(method) {
    RedirectableRequest.prototype[method] = function(a, b) {
      return this._currentRequest[method](a, b);
    };
  });
  ["aborted", "connection", "socket"].forEach(function(property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
      get: function() {
        return this._currentRequest[property];
      }
    });
  });
  RedirectableRequest.prototype._sanitizeOptions = function(options) {
    if (!options.headers) {
      options.headers = {};
    }
    if (options.host) {
      if (!options.hostname) {
        options.hostname = options.host;
      }
      delete options.host;
    }
    if (!options.pathname && options.path) {
      var searchPos = options.path.indexOf("?");
      if (searchPos < 0) {
        options.pathname = options.path;
      } else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  };
  RedirectableRequest.prototype._performRequest = function() {
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      throw new TypeError("Unsupported protocol " + protocol);
    }
    if (this._options.agents) {
      var scheme = protocol.slice(0, -1);
      this._options.agent = this._options.agents[scheme];
    }
    var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events) {
      request.on(event, eventHandlers[event]);
    }
    this._currentUrl = /^\//.test(this._options.path) ? url2.format(this._options) : this._options.path;
    if (this._isRedirect) {
      var i = 0;
      var self2 = this;
      var buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        if (request === self2._currentRequest) {
          if (error) {
            self2.emit("error", error);
          } else if (i < buffers.length) {
            var buffer = buffers[i++];
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          } else if (self2._ended) {
            request.end();
          }
        }
      })();
    }
  };
  RedirectableRequest.prototype._processResponse = function(response) {
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode
      });
    }
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);
      this._requestBodyBuffers = [];
      return;
    }
    destroyRequest(this._currentRequest);
    response.destroy();
    if (++this._redirectCount > this._options.maxRedirects) {
      throw new TooManyRedirectsError;
    }
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
      requestHeaders = Object.assign({
        Host: response.req.getHeader("host")
      }, this._options.headers);
    }
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
    var currentUrlParts = parseUrl(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url2.format(Object.assign(currentUrlParts, { host: currentHost }));
    var redirectUrl = resolveUrl(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);
    if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
      removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
    }
    if (isFunction2(beforeRedirect)) {
      var responseDetails = {
        headers: response.headers,
        statusCode
      };
      var requestDetails = {
        url: currentUrl,
        method,
        headers: requestHeaders
      };
      beforeRedirect(this._options, responseDetails, requestDetails);
      this._sanitizeOptions(this._options);
    }
    this._performRequest();
  };
  function wrap(protocols) {
    var exports2 = {
      maxRedirects: 21,
      maxBodyLength: 10 * 1024 * 1024
    };
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function(scheme) {
      var protocol = scheme + ":";
      var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
      var wrappedProtocol = exports2[scheme] = Object.create(nativeProtocol);
      function request(input, options, callback) {
        if (isURL(input)) {
          input = spreadUrlObject(input);
        } else if (isString2(input)) {
          input = spreadUrlObject(parseUrl(input));
        } else {
          callback = options;
          options = validateUrl(input);
          input = { protocol };
        }
        if (isFunction2(options)) {
          callback = options;
          options = null;
        }
        options = Object.assign({
          maxRedirects: exports2.maxRedirects,
          maxBodyLength: exports2.maxBodyLength
        }, input, options);
        options.nativeProtocols = nativeProtocols;
        if (!isString2(options.host) && !isString2(options.hostname)) {
          options.hostname = "::1";
        }
        assert.equal(options.protocol, protocol, "protocol mismatch");
        debug("options", options);
        return new RedirectableRequest(options, callback);
      }
      function get(input, options, callback) {
        var wrappedRequest = wrappedProtocol.request(input, options, callback);
        wrappedRequest.end();
        return wrappedRequest;
      }
      Object.defineProperties(wrappedProtocol, {
        request: { value: request, configurable: true, enumerable: true, writable: true },
        get: { value: get, configurable: true, enumerable: true, writable: true }
      });
    });
    return exports2;
  }
  function noop2() {}
  function parseUrl(input) {
    var parsed;
    if (useNativeURL) {
      parsed = new URL2(input);
    } else {
      parsed = validateUrl(url2.parse(input));
      if (!isString2(parsed.protocol)) {
        throw new InvalidUrlError({ input });
      }
    }
    return parsed;
  }
  function resolveUrl(relative, base) {
    return useNativeURL ? new URL2(relative, base) : parseUrl(url2.resolve(base, relative));
  }
  function validateUrl(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
      throw new InvalidUrlError({ input: input.href || input });
    }
    return input;
  }
  function spreadUrlObject(urlObject, target) {
    var spread = target || {};
    for (var key of preservedUrlFields) {
      spread[key] = urlObject[key];
    }
    if (spread.hostname.startsWith("[")) {
      spread.hostname = spread.hostname.slice(1, -1);
    }
    if (spread.port !== "") {
      spread.port = Number(spread.port);
    }
    spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
    return spread;
  }
  function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for (var header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return lastValue === null || typeof lastValue === "undefined" ? undefined : String(lastValue).trim();
  }
  function createErrorType(code, message, baseClass) {
    function CustomError(properties) {
      if (isFunction2(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor);
      }
      Object.assign(this, properties || {});
      this.code = code;
      this.message = this.cause ? message + ": " + this.cause.message : message;
    }
    CustomError.prototype = new (baseClass || Error);
    Object.defineProperties(CustomError.prototype, {
      constructor: {
        value: CustomError,
        enumerable: false
      },
      name: {
        value: "Error [" + code + "]",
        enumerable: false
      }
    });
    return CustomError;
  }
  function destroyRequest(request, error) {
    for (var event of events) {
      request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop2);
    request.destroy(error);
  }
  function isSubdomain(subdomain, domain) {
    assert(isString2(subdomain) && isString2(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
  }
  function isString2(value) {
    return typeof value === "string" || value instanceof String;
  }
  function isFunction2(value) {
    return typeof value === "function";
  }
  function isBuffer2(value) {
    return typeof value === "object" && "length" in value;
  }
  function isURL(value) {
    return URL2 && value instanceof URL2;
  }
  module.exports = wrap({ http, https });
  module.exports.wrap = wrap;
});

// node_modules/pino-std-serializers/lib/err-helpers.js
var require_err_helpers = __commonJS((exports, module) => {
  var isErrorLike = (err) => {
    return err && typeof err.message === "string";
  };
  var getErrorCause = (err) => {
    if (!err)
      return;
    const cause = err.cause;
    if (typeof cause === "function") {
      const causeResult = err.cause();
      return isErrorLike(causeResult) ? causeResult : undefined;
    } else {
      return isErrorLike(cause) ? cause : undefined;
    }
  };
  var _stackWithCauses = (err, seen) => {
    if (!isErrorLike(err))
      return "";
    const stack = err.stack || "";
    if (seen.has(err)) {
      return stack + `
causes have become circular...`;
    }
    const cause = getErrorCause(err);
    if (cause) {
      seen.add(err);
      return stack + `
caused by: ` + _stackWithCauses(cause, seen);
    } else {
      return stack;
    }
  };
  var stackWithCauses = (err) => _stackWithCauses(err, new Set);
  var _messageWithCauses = (err, seen, skip) => {
    if (!isErrorLike(err))
      return "";
    const message = skip ? "" : err.message || "";
    if (seen.has(err)) {
      return message + ": ...";
    }
    const cause = getErrorCause(err);
    if (cause) {
      seen.add(err);
      const skipIfVErrorStyleCause = typeof err.cause === "function";
      return message + (skipIfVErrorStyleCause ? "" : ": ") + _messageWithCauses(cause, seen, skipIfVErrorStyleCause);
    } else {
      return message;
    }
  };
  var messageWithCauses = (err) => _messageWithCauses(err, new Set);
  module.exports = {
    isErrorLike,
    getErrorCause,
    stackWithCauses,
    messageWithCauses
  };
});

// node_modules/pino-std-serializers/lib/err-proto.js
var require_err_proto = __commonJS((exports, module) => {
  var seen = Symbol("circular-ref-tag");
  var rawSymbol = Symbol("pino-raw-err-ref");
  var pinoErrProto = Object.create({}, {
    type: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    message: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    stack: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    aggregateErrors: {
      enumerable: true,
      writable: true,
      value: undefined
    },
    raw: {
      enumerable: false,
      get: function() {
        return this[rawSymbol];
      },
      set: function(val) {
        this[rawSymbol] = val;
      }
    }
  });
  Object.defineProperty(pinoErrProto, rawSymbol, {
    writable: true,
    value: {}
  });
  module.exports = {
    pinoErrProto,
    pinoErrorSymbols: {
      seen,
      rawSymbol
    }
  };
});

// node_modules/pino-std-serializers/lib/err.js
var require_err = __commonJS((exports, module) => {
  module.exports = errSerializer;
  var { messageWithCauses, stackWithCauses, isErrorLike } = require_err_helpers();
  var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
  var { seen } = pinoErrorSymbols;
  var { toString: toString3 } = Object.prototype;
  function errSerializer(err) {
    if (!isErrorLike(err)) {
      return err;
    }
    err[seen] = undefined;
    const _err = Object.create(pinoErrProto);
    _err.type = toString3.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
    _err.message = messageWithCauses(err);
    _err.stack = stackWithCauses(err);
    if (Array.isArray(err.errors)) {
      _err.aggregateErrors = err.errors.map((err2) => errSerializer(err2));
    }
    for (const key in err) {
      if (_err[key] === undefined) {
        const val = err[key];
        if (isErrorLike(val)) {
          if (key !== "cause" && !Object.prototype.hasOwnProperty.call(val, seen)) {
            _err[key] = errSerializer(val);
          }
        } else {
          _err[key] = val;
        }
      }
    }
    delete err[seen];
    _err.raw = err;
    return _err;
  }
});

// node_modules/pino-std-serializers/lib/err-with-cause.js
var require_err_with_cause = __commonJS((exports, module) => {
  module.exports = errWithCauseSerializer;
  var { isErrorLike } = require_err_helpers();
  var { pinoErrProto, pinoErrorSymbols } = require_err_proto();
  var { seen } = pinoErrorSymbols;
  var { toString: toString3 } = Object.prototype;
  function errWithCauseSerializer(err) {
    if (!isErrorLike(err)) {
      return err;
    }
    err[seen] = undefined;
    const _err = Object.create(pinoErrProto);
    _err.type = toString3.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
    _err.message = err.message;
    _err.stack = err.stack;
    if (Array.isArray(err.errors)) {
      _err.aggregateErrors = err.errors.map((err2) => errWithCauseSerializer(err2));
    }
    if (isErrorLike(err.cause) && !Object.prototype.hasOwnProperty.call(err.cause, seen)) {
      _err.cause = errWithCauseSerializer(err.cause);
    }
    for (const key in err) {
      if (_err[key] === undefined) {
        const val = err[key];
        if (isErrorLike(val)) {
          if (!Object.prototype.hasOwnProperty.call(val, seen)) {
            _err[key] = errWithCauseSerializer(val);
          }
        } else {
          _err[key] = val;
        }
      }
    }
    delete err[seen];
    _err.raw = err;
    return _err;
  }
});

// node_modules/pino-std-serializers/lib/req.js
var require_req = __commonJS((exports, module) => {
  module.exports = {
    mapHttpRequest,
    reqSerializer
  };
  var rawSymbol = Symbol("pino-raw-req-ref");
  var pinoReqProto = Object.create({}, {
    id: {
      enumerable: true,
      writable: true,
      value: ""
    },
    method: {
      enumerable: true,
      writable: true,
      value: ""
    },
    url: {
      enumerable: true,
      writable: true,
      value: ""
    },
    query: {
      enumerable: true,
      writable: true,
      value: ""
    },
    params: {
      enumerable: true,
      writable: true,
      value: ""
    },
    headers: {
      enumerable: true,
      writable: true,
      value: {}
    },
    remoteAddress: {
      enumerable: true,
      writable: true,
      value: ""
    },
    remotePort: {
      enumerable: true,
      writable: true,
      value: ""
    },
    raw: {
      enumerable: false,
      get: function() {
        return this[rawSymbol];
      },
      set: function(val) {
        this[rawSymbol] = val;
      }
    }
  });
  Object.defineProperty(pinoReqProto, rawSymbol, {
    writable: true,
    value: {}
  });
  function reqSerializer(req) {
    const connection = req.info || req.socket;
    const _req = Object.create(pinoReqProto);
    _req.id = typeof req.id === "function" ? req.id() : req.id || (req.info ? req.info.id : undefined);
    _req.method = req.method;
    if (req.originalUrl) {
      _req.url = req.originalUrl;
    } else {
      const path = req.path;
      _req.url = typeof path === "string" ? path : req.url ? req.url.path || req.url : undefined;
    }
    if (req.query) {
      _req.query = req.query;
    }
    if (req.params) {
      _req.params = req.params;
    }
    _req.headers = req.headers;
    _req.remoteAddress = connection && connection.remoteAddress;
    _req.remotePort = connection && connection.remotePort;
    _req.raw = req.raw || req;
    return _req;
  }
  function mapHttpRequest(req) {
    return {
      req: reqSerializer(req)
    };
  }
});

// node_modules/pino-std-serializers/lib/res.js
var require_res = __commonJS((exports, module) => {
  module.exports = {
    mapHttpResponse,
    resSerializer
  };
  var rawSymbol = Symbol("pino-raw-res-ref");
  var pinoResProto = Object.create({}, {
    statusCode: {
      enumerable: true,
      writable: true,
      value: 0
    },
    headers: {
      enumerable: true,
      writable: true,
      value: ""
    },
    raw: {
      enumerable: false,
      get: function() {
        return this[rawSymbol];
      },
      set: function(val) {
        this[rawSymbol] = val;
      }
    }
  });
  Object.defineProperty(pinoResProto, rawSymbol, {
    writable: true,
    value: {}
  });
  function resSerializer(res) {
    const _res = Object.create(pinoResProto);
    _res.statusCode = res.headersSent ? res.statusCode : null;
    _res.headers = res.getHeaders ? res.getHeaders() : res._headers;
    _res.raw = res;
    return _res;
  }
  function mapHttpResponse(res) {
    return {
      res: resSerializer(res)
    };
  }
});

// node_modules/pino-std-serializers/index.js
var require_pino_std_serializers = __commonJS((exports, module) => {
  var errSerializer = require_err();
  var errWithCauseSerializer = require_err_with_cause();
  var reqSerializers = require_req();
  var resSerializers = require_res();
  module.exports = {
    err: errSerializer,
    errWithCause: errWithCauseSerializer,
    mapHttpRequest: reqSerializers.mapHttpRequest,
    mapHttpResponse: resSerializers.mapHttpResponse,
    req: reqSerializers.reqSerializer,
    res: resSerializers.resSerializer,
    wrapErrorSerializer: function wrapErrorSerializer(customSerializer) {
      if (customSerializer === errSerializer)
        return customSerializer;
      return function wrapErrSerializer(err) {
        return customSerializer(errSerializer(err));
      };
    },
    wrapRequestSerializer: function wrapRequestSerializer(customSerializer) {
      if (customSerializer === reqSerializers.reqSerializer)
        return customSerializer;
      return function wrappedReqSerializer(req) {
        return customSerializer(reqSerializers.reqSerializer(req));
      };
    },
    wrapResponseSerializer: function wrapResponseSerializer(customSerializer) {
      if (customSerializer === resSerializers.resSerializer)
        return customSerializer;
      return function wrappedResSerializer(res) {
        return customSerializer(resSerializers.resSerializer(res));
      };
    }
  };
});

// node_modules/pino/lib/caller.js
var require_caller = __commonJS((exports, module) => {
  function noOpPrepareStackTrace(_, stack) {
    return stack;
  }
  module.exports = function getCallers() {
    const originalPrepare = Error.prepareStackTrace;
    Error.prepareStackTrace = noOpPrepareStackTrace;
    const stack = new Error().stack;
    Error.prepareStackTrace = originalPrepare;
    if (!Array.isArray(stack)) {
      return;
    }
    const entries = stack.slice(2);
    const fileNames = [];
    for (const entry of entries) {
      if (!entry) {
        continue;
      }
      fileNames.push(entry.getFileName());
    }
    return fileNames;
  };
});

// node_modules/fast-redact/lib/validator.js
var require_validator = __commonJS((exports, module) => {
  module.exports = validator;
  function validator(opts = {}) {
    const {
      ERR_PATHS_MUST_BE_STRINGS = () => "fast-redact - Paths must be (non-empty) strings",
      ERR_INVALID_PATH = (s) => `fast-redact – Invalid path (${s})`
    } = opts;
    return function validate({ paths }) {
      paths.forEach((s) => {
        if (typeof s !== "string") {
          throw Error(ERR_PATHS_MUST_BE_STRINGS());
        }
        try {
          if (/〇/.test(s))
            throw Error();
          const expr = (s[0] === "[" ? "" : ".") + s.replace(/^\*/, "〇").replace(/\.\*/g, ".〇").replace(/\[\*\]/g, "[〇]");
          if (/\n|\r|;/.test(expr))
            throw Error();
          if (/\/\*/.test(expr))
            throw Error();
          Function(`
            'use strict'
            const o = new Proxy({}, { get: () => o, set: () => { throw Error() } });
            const 〇 = null;
            o${expr}
            if ([o${expr}].length !== 1) throw Error()`)();
        } catch (e) {
          throw Error(ERR_INVALID_PATH(s));
        }
      });
    };
  }
});

// node_modules/fast-redact/lib/rx.js
var require_rx = __commonJS((exports, module) => {
  module.exports = /[^.[\]]+|\[((?:.)*?)\]/g;
});

// node_modules/fast-redact/lib/parse.js
var require_parse = __commonJS((exports, module) => {
  var rx = require_rx();
  module.exports = parse;
  function parse({ paths }) {
    const wildcards = [];
    var wcLen = 0;
    const secret = paths.reduce(function(o, strPath, ix) {
      var path = strPath.match(rx).map((p) => p.replace(/'|"|`/g, ""));
      const leadingBracket = strPath[0] === "[";
      path = path.map((p) => {
        if (p[0] === "[")
          return p.substr(1, p.length - 2);
        else
          return p;
      });
      const star = path.indexOf("*");
      if (star > -1) {
        const before = path.slice(0, star);
        const beforeStr = before.join(".");
        const after = path.slice(star + 1, path.length);
        const nested = after.length > 0;
        wcLen++;
        wildcards.push({
          before,
          beforeStr,
          after,
          nested
        });
      } else {
        o[strPath] = {
          path,
          val: undefined,
          precensored: false,
          circle: "",
          escPath: JSON.stringify(strPath),
          leadingBracket
        };
      }
      return o;
    }, {});
    return { wildcards, wcLen, secret };
  }
});

// node_modules/fast-redact/lib/redactor.js
var require_redactor = __commonJS((exports, module) => {
  var rx = require_rx();
  module.exports = redactor;
  function redactor({ secret, serialize, wcLen, strict, isCensorFct, censorFctTakesPath }, state) {
    const redact = Function("o", `
    if (typeof o !== 'object' || o == null) {
      ${strictImpl(strict, serialize)}
    }
    const { censor, secret } = this
    const originalSecret = {}
    const secretKeys = Object.keys(secret)
    for (var i = 0; i < secretKeys.length; i++) {
      originalSecret[secretKeys[i]] = secret[secretKeys[i]]
    }

    ${redactTmpl(secret, isCensorFct, censorFctTakesPath)}
    this.compileRestore()
    ${dynamicRedactTmpl(wcLen > 0, isCensorFct, censorFctTakesPath)}
    this.secret = originalSecret
    ${resultTmpl(serialize)}
  `).bind(state);
    redact.state = state;
    if (serialize === false) {
      redact.restore = (o) => state.restore(o);
    }
    return redact;
  }
  function redactTmpl(secret, isCensorFct, censorFctTakesPath) {
    return Object.keys(secret).map((path) => {
      const { escPath, leadingBracket, path: arrPath } = secret[path];
      const skip = leadingBracket ? 1 : 0;
      const delim = leadingBracket ? "" : ".";
      const hops = [];
      var match;
      while ((match = rx.exec(path)) !== null) {
        const [, ix] = match;
        const { index, input } = match;
        if (index > skip)
          hops.push(input.substring(0, index - (ix ? 0 : 1)));
      }
      var existence = hops.map((p) => `o${delim}${p}`).join(" && ");
      if (existence.length === 0)
        existence += `o${delim}${path} != null`;
      else
        existence += ` && o${delim}${path} != null`;
      const circularDetection = `
      switch (true) {
        ${hops.reverse().map((p) => `
          case o${delim}${p} === censor:
            secret[${escPath}].circle = ${JSON.stringify(p)}
            break
        `).join(`
`)}
      }
    `;
      const censorArgs = censorFctTakesPath ? `val, ${JSON.stringify(arrPath)}` : `val`;
      return `
      if (${existence}) {
        const val = o${delim}${path}
        if (val === censor) {
          secret[${escPath}].precensored = true
        } else {
          secret[${escPath}].val = val
          o${delim}${path} = ${isCensorFct ? `censor(${censorArgs})` : "censor"}
          ${circularDetection}
        }
      }
    `;
    }).join(`
`);
  }
  function dynamicRedactTmpl(hasWildcards, isCensorFct, censorFctTakesPath) {
    return hasWildcards === true ? `
    {
      const { wildcards, wcLen, groupRedact, nestedRedact } = this
      for (var i = 0; i < wcLen; i++) {
        const { before, beforeStr, after, nested } = wildcards[i]
        if (nested === true) {
          secret[beforeStr] = secret[beforeStr] || []
          nestedRedact(secret[beforeStr], o, before, after, censor, ${isCensorFct}, ${censorFctTakesPath})
        } else secret[beforeStr] = groupRedact(o, before, censor, ${isCensorFct}, ${censorFctTakesPath})
      }
    }
  ` : "";
  }
  function resultTmpl(serialize) {
    return serialize === false ? `return o` : `
    var s = this.serialize(o)
    this.restore(o)
    return s
  `;
  }
  function strictImpl(strict, serialize) {
    return strict === true ? `throw Error('fast-redact: primitives cannot be redacted')` : serialize === false ? `return o` : `return this.serialize(o)`;
  }
});

// node_modules/fast-redact/lib/modifiers.js
var require_modifiers = __commonJS((exports, module) => {
  module.exports = {
    groupRedact,
    groupRestore,
    nestedRedact,
    nestedRestore
  };
  function groupRestore({ keys, values, target }) {
    if (target == null || typeof target === "string")
      return;
    const length = keys.length;
    for (var i = 0;i < length; i++) {
      const k = keys[i];
      target[k] = values[i];
    }
  }
  function groupRedact(o, path, censor, isCensorFct, censorFctTakesPath) {
    const target = get(o, path);
    if (target == null || typeof target === "string")
      return { keys: null, values: null, target, flat: true };
    const keys = Object.keys(target);
    const keysLength = keys.length;
    const pathLength = path.length;
    const pathWithKey = censorFctTakesPath ? [...path] : undefined;
    const values = new Array(keysLength);
    for (var i = 0;i < keysLength; i++) {
      const key = keys[i];
      values[i] = target[key];
      if (censorFctTakesPath) {
        pathWithKey[pathLength] = key;
        target[key] = censor(target[key], pathWithKey);
      } else if (isCensorFct) {
        target[key] = censor(target[key]);
      } else {
        target[key] = censor;
      }
    }
    return { keys, values, target, flat: true };
  }
  function nestedRestore(instructions) {
    for (let i = 0;i < instructions.length; i++) {
      const { target, path, value } = instructions[i];
      let current = target;
      for (let i2 = path.length - 1;i2 > 0; i2--) {
        current = current[path[i2]];
      }
      current[path[0]] = value;
    }
  }
  function nestedRedact(store, o, path, ns, censor, isCensorFct, censorFctTakesPath) {
    const target = get(o, path);
    if (target == null)
      return;
    const keys = Object.keys(target);
    const keysLength = keys.length;
    for (var i = 0;i < keysLength; i++) {
      const key = keys[i];
      specialSet(store, target, key, path, ns, censor, isCensorFct, censorFctTakesPath);
    }
    return store;
  }
  function has(obj, prop) {
    return obj !== undefined && obj !== null ? "hasOwn" in Object ? Object.hasOwn(obj, prop) : Object.prototype.hasOwnProperty.call(obj, prop) : false;
  }
  function specialSet(store, o, k, path, afterPath, censor, isCensorFct, censorFctTakesPath) {
    const afterPathLen = afterPath.length;
    const lastPathIndex = afterPathLen - 1;
    const originalKey = k;
    var i = -1;
    var n;
    var nv;
    var ov;
    var oov = null;
    var wc = null;
    var kIsWc;
    var wcov;
    var consecutive = false;
    var level = 0;
    var depth = 0;
    var redactPathCurrent = tree();
    ov = n = o[k];
    if (typeof n !== "object")
      return;
    while (n != null && ++i < afterPathLen) {
      depth += 1;
      k = afterPath[i];
      oov = ov;
      if (k !== "*" && !wc && !(typeof n === "object" && (k in n))) {
        break;
      }
      if (k === "*") {
        if (wc === "*") {
          consecutive = true;
        }
        wc = k;
        if (i !== lastPathIndex) {
          continue;
        }
      }
      if (wc) {
        const wcKeys = Object.keys(n);
        for (var j = 0;j < wcKeys.length; j++) {
          const wck = wcKeys[j];
          wcov = n[wck];
          kIsWc = k === "*";
          if (consecutive) {
            redactPathCurrent = node(redactPathCurrent, wck, depth);
            level = i;
            ov = iterateNthLevel(wcov, level - 1, k, path, afterPath, censor, isCensorFct, censorFctTakesPath, originalKey, n, nv, ov, kIsWc, wck, i, lastPathIndex, redactPathCurrent, store, o[originalKey], depth + 1);
          } else {
            if (kIsWc || typeof wcov === "object" && wcov !== null && k in wcov) {
              if (kIsWc) {
                ov = wcov;
              } else {
                ov = wcov[k];
              }
              nv = i !== lastPathIndex ? ov : isCensorFct ? censorFctTakesPath ? censor(ov, [...path, originalKey, ...afterPath]) : censor(ov) : censor;
              if (kIsWc) {
                const rv = restoreInstr(node(redactPathCurrent, wck, depth), ov, o[originalKey]);
                store.push(rv);
                n[wck] = nv;
              } else {
                if (wcov[k] === nv) {} else if (nv === undefined && censor !== undefined || has(wcov, k) && nv === ov) {
                  redactPathCurrent = node(redactPathCurrent, wck, depth);
                } else {
                  redactPathCurrent = node(redactPathCurrent, wck, depth);
                  const rv = restoreInstr(node(redactPathCurrent, k, depth + 1), ov, o[originalKey]);
                  store.push(rv);
                  wcov[k] = nv;
                }
              }
            }
          }
        }
        wc = null;
      } else {
        ov = n[k];
        redactPathCurrent = node(redactPathCurrent, k, depth);
        nv = i !== lastPathIndex ? ov : isCensorFct ? censorFctTakesPath ? censor(ov, [...path, originalKey, ...afterPath]) : censor(ov) : censor;
        if (has(n, k) && nv === ov || nv === undefined && censor !== undefined) {} else {
          const rv = restoreInstr(redactPathCurrent, ov, o[originalKey]);
          store.push(rv);
          n[k] = nv;
        }
        n = n[k];
      }
      if (typeof n !== "object")
        break;
      if (ov === oov || typeof ov === "undefined") {}
    }
  }
  function get(o, p) {
    var i = -1;
    var l = p.length;
    var n = o;
    while (n != null && ++i < l) {
      n = n[p[i]];
    }
    return n;
  }
  function iterateNthLevel(wcov, level, k, path, afterPath, censor, isCensorFct, censorFctTakesPath, originalKey, n, nv, ov, kIsWc, wck, i, lastPathIndex, redactPathCurrent, store, parent, depth) {
    if (level === 0) {
      if (kIsWc || typeof wcov === "object" && wcov !== null && k in wcov) {
        if (kIsWc) {
          ov = wcov;
        } else {
          ov = wcov[k];
        }
        nv = i !== lastPathIndex ? ov : isCensorFct ? censorFctTakesPath ? censor(ov, [...path, originalKey, ...afterPath]) : censor(ov) : censor;
        if (kIsWc) {
          const rv = restoreInstr(redactPathCurrent, ov, parent);
          store.push(rv);
          n[wck] = nv;
        } else {
          if (wcov[k] === nv) {} else if (nv === undefined && censor !== undefined || has(wcov, k) && nv === ov) {} else {
            const rv = restoreInstr(node(redactPathCurrent, k, depth + 1), ov, parent);
            store.push(rv);
            wcov[k] = nv;
          }
        }
      }
    }
    for (const key in wcov) {
      if (typeof wcov[key] === "object") {
        redactPathCurrent = node(redactPathCurrent, key, depth);
        iterateNthLevel(wcov[key], level - 1, k, path, afterPath, censor, isCensorFct, censorFctTakesPath, originalKey, n, nv, ov, kIsWc, wck, i, lastPathIndex, redactPathCurrent, store, parent, depth + 1);
      }
    }
  }
  function tree() {
    return { parent: null, key: null, children: [], depth: 0 };
  }
  function node(parent, key, depth) {
    if (parent.depth === depth) {
      return node(parent.parent, key, depth);
    }
    var child = {
      parent,
      key,
      depth,
      children: []
    };
    parent.children.push(child);
    return child;
  }
  function restoreInstr(node2, value, target) {
    let current = node2;
    const path = [];
    do {
      path.push(current.key);
      current = current.parent;
    } while (current.parent != null);
    return { path, value, target };
  }
});

// node_modules/fast-redact/lib/restorer.js
var require_restorer = __commonJS((exports, module) => {
  var { groupRestore, nestedRestore } = require_modifiers();
  module.exports = restorer;
  function restorer() {
    return function compileRestore() {
      if (this.restore) {
        this.restore.state.secret = this.secret;
        return;
      }
      const { secret, wcLen } = this;
      const paths = Object.keys(secret);
      const resetters = resetTmpl(secret, paths);
      const hasWildcards = wcLen > 0;
      const state = hasWildcards ? { secret, groupRestore, nestedRestore } : { secret };
      this.restore = Function("o", restoreTmpl(resetters, paths, hasWildcards)).bind(state);
      this.restore.state = state;
    };
  }
  function resetTmpl(secret, paths) {
    return paths.map((path) => {
      const { circle, escPath, leadingBracket } = secret[path];
      const delim = leadingBracket ? "" : ".";
      const reset = circle ? `o.${circle} = secret[${escPath}].val` : `o${delim}${path} = secret[${escPath}].val`;
      const clear = `secret[${escPath}].val = undefined`;
      return `
      if (secret[${escPath}].val !== undefined) {
        try { ${reset} } catch (e) {}
        ${clear}
      }
    `;
    }).join("");
  }
  function restoreTmpl(resetters, paths, hasWildcards) {
    const dynamicReset = hasWildcards === true ? `
    const keys = Object.keys(secret)
    const len = keys.length
    for (var i = len - 1; i >= ${paths.length}; i--) {
      const k = keys[i]
      const o = secret[k]
      if (o) {
        if (o.flat === true) this.groupRestore(o)
        else this.nestedRestore(o)
        secret[k] = null
      }
    }
  ` : "";
    return `
    const secret = this.secret
    ${dynamicReset}
    ${resetters}
    return o
  `;
  }
});

// node_modules/fast-redact/lib/state.js
var require_state2 = __commonJS((exports, module) => {
  module.exports = state;
  function state(o) {
    const {
      secret,
      censor,
      compileRestore,
      serialize,
      groupRedact,
      nestedRedact,
      wildcards,
      wcLen
    } = o;
    const builder = [{ secret, censor, compileRestore }];
    if (serialize !== false)
      builder.push({ serialize });
    if (wcLen > 0)
      builder.push({ groupRedact, nestedRedact, wildcards, wcLen });
    return Object.assign(...builder);
  }
});

// node_modules/fast-redact/index.js
var require_fast_redact = __commonJS((exports, module) => {
  var validator = require_validator();
  var parse = require_parse();
  var redactor = require_redactor();
  var restorer = require_restorer();
  var { groupRedact, nestedRedact } = require_modifiers();
  var state = require_state2();
  var rx = require_rx();
  var validate = validator();
  var noop2 = (o) => o;
  noop2.restore = noop2;
  var DEFAULT_CENSOR = "[REDACTED]";
  fastRedact.rx = rx;
  fastRedact.validator = validator;
  module.exports = fastRedact;
  function fastRedact(opts = {}) {
    const paths = Array.from(new Set(opts.paths || []));
    const serialize = "serialize" in opts ? opts.serialize === false ? opts.serialize : typeof opts.serialize === "function" ? opts.serialize : JSON.stringify : JSON.stringify;
    const remove = opts.remove;
    if (remove === true && serialize !== JSON.stringify) {
      throw Error("fast-redact – remove option may only be set when serializer is JSON.stringify");
    }
    const censor = remove === true ? undefined : ("censor" in opts) ? opts.censor : DEFAULT_CENSOR;
    const isCensorFct = typeof censor === "function";
    const censorFctTakesPath = isCensorFct && censor.length > 1;
    if (paths.length === 0)
      return serialize || noop2;
    validate({ paths, serialize, censor });
    const { wildcards, wcLen, secret } = parse({ paths, censor });
    const compileRestore = restorer();
    const strict = "strict" in opts ? opts.strict : true;
    return redactor({ secret, wcLen, serialize, strict, isCensorFct, censorFctTakesPath }, state({
      secret,
      censor,
      compileRestore,
      serialize,
      groupRedact,
      nestedRedact,
      wildcards,
      wcLen
    }));
  }
});

// node_modules/pino/lib/symbols.js
var require_symbols = __commonJS((exports, module) => {
  var setLevelSym = Symbol("pino.setLevel");
  var getLevelSym = Symbol("pino.getLevel");
  var levelValSym = Symbol("pino.levelVal");
  var levelCompSym = Symbol("pino.levelComp");
  var useLevelLabelsSym = Symbol("pino.useLevelLabels");
  var useOnlyCustomLevelsSym = Symbol("pino.useOnlyCustomLevels");
  var mixinSym = Symbol("pino.mixin");
  var lsCacheSym = Symbol("pino.lsCache");
  var chindingsSym = Symbol("pino.chindings");
  var asJsonSym = Symbol("pino.asJson");
  var writeSym = Symbol("pino.write");
  var redactFmtSym = Symbol("pino.redactFmt");
  var timeSym = Symbol("pino.time");
  var timeSliceIndexSym = Symbol("pino.timeSliceIndex");
  var streamSym = Symbol("pino.stream");
  var stringifySym = Symbol("pino.stringify");
  var stringifySafeSym = Symbol("pino.stringifySafe");
  var stringifiersSym = Symbol("pino.stringifiers");
  var endSym = Symbol("pino.end");
  var formatOptsSym = Symbol("pino.formatOpts");
  var messageKeySym = Symbol("pino.messageKey");
  var errorKeySym = Symbol("pino.errorKey");
  var nestedKeySym = Symbol("pino.nestedKey");
  var nestedKeyStrSym = Symbol("pino.nestedKeyStr");
  var mixinMergeStrategySym = Symbol("pino.mixinMergeStrategy");
  var msgPrefixSym = Symbol("pino.msgPrefix");
  var wildcardFirstSym = Symbol("pino.wildcardFirst");
  var serializersSym = Symbol.for("pino.serializers");
  var formattersSym = Symbol.for("pino.formatters");
  var hooksSym = Symbol.for("pino.hooks");
  var needsMetadataGsym = Symbol.for("pino.metadata");
  module.exports = {
    setLevelSym,
    getLevelSym,
    levelValSym,
    levelCompSym,
    useLevelLabelsSym,
    mixinSym,
    lsCacheSym,
    chindingsSym,
    asJsonSym,
    writeSym,
    serializersSym,
    redactFmtSym,
    timeSym,
    timeSliceIndexSym,
    streamSym,
    stringifySym,
    stringifySafeSym,
    stringifiersSym,
    endSym,
    formatOptsSym,
    messageKeySym,
    errorKeySym,
    nestedKeySym,
    wildcardFirstSym,
    needsMetadataGsym,
    useOnlyCustomLevelsSym,
    formattersSym,
    hooksSym,
    nestedKeyStrSym,
    mixinMergeStrategySym,
    msgPrefixSym
  };
});

// node_modules/pino/lib/redaction.js
var require_redaction = __commonJS((exports, module) => {
  var fastRedact = require_fast_redact();
  var { redactFmtSym, wildcardFirstSym } = require_symbols();
  var { rx, validator } = fastRedact;
  var validate = validator({
    ERR_PATHS_MUST_BE_STRINGS: () => "pino – redacted paths must be strings",
    ERR_INVALID_PATH: (s) => `pino – redact paths array contains an invalid path (${s})`
  });
  var CENSOR = "[Redacted]";
  var strict = false;
  function redaction(opts, serialize) {
    const { paths, censor } = handle(opts);
    const shape = paths.reduce((o, str) => {
      rx.lastIndex = 0;
      const first = rx.exec(str);
      const next = rx.exec(str);
      let ns = first[1] !== undefined ? first[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, "$1") : first[0];
      if (ns === "*") {
        ns = wildcardFirstSym;
      }
      if (next === null) {
        o[ns] = null;
        return o;
      }
      if (o[ns] === null) {
        return o;
      }
      const { index } = next;
      const nextPath = `${str.substr(index, str.length - 1)}`;
      o[ns] = o[ns] || [];
      if (ns !== wildcardFirstSym && o[ns].length === 0) {
        o[ns].push(...o[wildcardFirstSym] || []);
      }
      if (ns === wildcardFirstSym) {
        Object.keys(o).forEach(function(k) {
          if (o[k]) {
            o[k].push(nextPath);
          }
        });
      }
      o[ns].push(nextPath);
      return o;
    }, {});
    const result = {
      [redactFmtSym]: fastRedact({ paths, censor, serialize, strict })
    };
    const topCensor = (...args) => {
      return typeof censor === "function" ? serialize(censor(...args)) : serialize(censor);
    };
    return [...Object.keys(shape), ...Object.getOwnPropertySymbols(shape)].reduce((o, k) => {
      if (shape[k] === null) {
        o[k] = (value) => topCensor(value, [k]);
      } else {
        const wrappedCensor = typeof censor === "function" ? (value, path) => {
          return censor(value, [k, ...path]);
        } : censor;
        o[k] = fastRedact({
          paths: shape[k],
          censor: wrappedCensor,
          serialize,
          strict
        });
      }
      return o;
    }, result);
  }
  function handle(opts) {
    if (Array.isArray(opts)) {
      opts = { paths: opts, censor: CENSOR };
      validate(opts);
      return opts;
    }
    let { paths, censor = CENSOR, remove } = opts;
    if (Array.isArray(paths) === false) {
      throw Error("pino – redact must contain an array of strings");
    }
    if (remove === true)
      censor = undefined;
    validate({ paths, censor });
    return { paths, censor };
  }
  module.exports = redaction;
});

// node_modules/pino/lib/time.js
var require_time = __commonJS((exports, module) => {
  var nullTime = () => "";
  var epochTime = () => `,"time":${Date.now()}`;
  var unixTime = () => `,"time":${Math.round(Date.now() / 1000)}`;
  var isoTime = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
  module.exports = { nullTime, epochTime, unixTime, isoTime };
});

// node_modules/quick-format-unescaped/index.js
var require_quick_format_unescaped = __commonJS((exports, module) => {
  function tryStringify(o) {
    try {
      return JSON.stringify(o);
    } catch (e) {
      return '"[Circular]"';
    }
  }
  module.exports = format;
  function format(f, args, opts) {
    var ss = opts && opts.stringify || tryStringify;
    var offset = 1;
    if (typeof f === "object" && f !== null) {
      var len = args.length + offset;
      if (len === 1)
        return f;
      var objects = new Array(len);
      objects[0] = ss(f);
      for (var index = 1;index < len; index++) {
        objects[index] = ss(args[index]);
      }
      return objects.join(" ");
    }
    if (typeof f !== "string") {
      return f;
    }
    var argLen = args.length;
    if (argLen === 0)
      return f;
    var str = "";
    var a = 1 - offset;
    var lastPos = -1;
    var flen = f && f.length || 0;
    for (var i = 0;i < flen; ) {
      if (f.charCodeAt(i) === 37 && i + 1 < flen) {
        lastPos = lastPos > -1 ? lastPos : 0;
        switch (f.charCodeAt(i + 1)) {
          case 100:
          case 102:
            if (a >= argLen)
              break;
            if (args[a] == null)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += Number(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 105:
            if (a >= argLen)
              break;
            if (args[a] == null)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += Math.floor(Number(args[a]));
            lastPos = i + 2;
            i++;
            break;
          case 79:
          case 111:
          case 106:
            if (a >= argLen)
              break;
            if (args[a] === undefined)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            var type = typeof args[a];
            if (type === "string") {
              str += "'" + args[a] + "'";
              lastPos = i + 2;
              i++;
              break;
            }
            if (type === "function") {
              str += args[a].name || "<anonymous>";
              lastPos = i + 2;
              i++;
              break;
            }
            str += ss(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 115:
            if (a >= argLen)
              break;
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += String(args[a]);
            lastPos = i + 2;
            i++;
            break;
          case 37:
            if (lastPos < i)
              str += f.slice(lastPos, i);
            str += "%";
            lastPos = i + 2;
            i++;
            a--;
            break;
        }
        ++a;
      }
      ++i;
    }
    if (lastPos === -1)
      return f;
    else if (lastPos < flen) {
      str += f.slice(lastPos);
    }
    return str;
  }
});

// node_modules/atomic-sleep/index.js
var require_atomic_sleep = __commonJS((exports, module) => {
  if (typeof SharedArrayBuffer !== "undefined" && typeof Atomics !== "undefined") {
    let sleep = function(ms) {
      const valid = ms > 0 && ms < Infinity;
      if (valid === false) {
        if (typeof ms !== "number" && typeof ms !== "bigint") {
          throw TypeError("sleep: ms must be a number");
        }
        throw RangeError("sleep: ms must be a number that is greater than 0 but less than Infinity");
      }
      Atomics.wait(nil, 0, 0, Number(ms));
    };
    const nil = new Int32Array(new SharedArrayBuffer(4));
    module.exports = sleep;
  } else {
    let sleep = function(ms) {
      const valid = ms > 0 && ms < Infinity;
      if (valid === false) {
        if (typeof ms !== "number" && typeof ms !== "bigint") {
          throw TypeError("sleep: ms must be a number");
        }
        throw RangeError("sleep: ms must be a number that is greater than 0 but less than Infinity");
      }
      const target = Date.now() + Number(ms);
      while (target > Date.now()) {}
    };
    module.exports = sleep;
  }
});

// node_modules/sonic-boom/index.js
var require_sonic_boom = __commonJS((exports, module) => {
  var fs = __require("fs");
  var EventEmitter2 = __require("events");
  var inherits2 = __require("util").inherits;
  var path = __require("path");
  var sleep = require_atomic_sleep();
  var BUSY_WRITE_TIMEOUT = 100;
  var kEmptyBuffer = Buffer.allocUnsafe(0);
  var MAX_WRITE = 16 * 1024;
  var kContentModeBuffer = "buffer";
  var kContentModeUtf8 = "utf8";
  function openFile(file, sonic) {
    sonic._opening = true;
    sonic._writing = true;
    sonic._asyncDrainScheduled = false;
    function fileOpened(err, fd) {
      if (err) {
        sonic._reopening = false;
        sonic._writing = false;
        sonic._opening = false;
        if (sonic.sync) {
          process.nextTick(() => {
            if (sonic.listenerCount("error") > 0) {
              sonic.emit("error", err);
            }
          });
        } else {
          sonic.emit("error", err);
        }
        return;
      }
      const reopening = sonic._reopening;
      sonic.fd = fd;
      sonic.file = file;
      sonic._reopening = false;
      sonic._opening = false;
      sonic._writing = false;
      if (sonic.sync) {
        process.nextTick(() => sonic.emit("ready"));
      } else {
        sonic.emit("ready");
      }
      if (sonic.destroyed) {
        return;
      }
      if (!sonic._writing && sonic._len > sonic.minLength || sonic._flushPending) {
        sonic._actualWrite();
      } else if (reopening) {
        process.nextTick(() => sonic.emit("drain"));
      }
    }
    const flags = sonic.append ? "a" : "w";
    const mode = sonic.mode;
    if (sonic.sync) {
      try {
        if (sonic.mkdir)
          fs.mkdirSync(path.dirname(file), { recursive: true });
        const fd = fs.openSync(file, flags, mode);
        fileOpened(null, fd);
      } catch (err) {
        fileOpened(err);
        throw err;
      }
    } else if (sonic.mkdir) {
      fs.mkdir(path.dirname(file), { recursive: true }, (err) => {
        if (err)
          return fileOpened(err);
        fs.open(file, flags, mode, fileOpened);
      });
    } else {
      fs.open(file, flags, mode, fileOpened);
    }
  }
  function SonicBoom(opts) {
    if (!(this instanceof SonicBoom)) {
      return new SonicBoom(opts);
    }
    let { fd, dest, minLength, maxLength, maxWrite, sync, append: append2 = true, mkdir, retryEAGAIN, fsync, contentMode, mode } = opts || {};
    fd = fd || dest;
    this._len = 0;
    this.fd = -1;
    this._bufs = [];
    this._lens = [];
    this._writing = false;
    this._ending = false;
    this._reopening = false;
    this._asyncDrainScheduled = false;
    this._flushPending = false;
    this._hwm = Math.max(minLength || 0, 16387);
    this.file = null;
    this.destroyed = false;
    this.minLength = minLength || 0;
    this.maxLength = maxLength || 0;
    this.maxWrite = maxWrite || MAX_WRITE;
    this.sync = sync || false;
    this.writable = true;
    this._fsync = fsync || false;
    this.append = append2 || false;
    this.mode = mode;
    this.retryEAGAIN = retryEAGAIN || (() => true);
    this.mkdir = mkdir || false;
    let fsWriteSync;
    let fsWrite;
    if (contentMode === kContentModeBuffer) {
      this._writingBuf = kEmptyBuffer;
      this.write = writeBuffer;
      this.flush = flushBuffer;
      this.flushSync = flushBufferSync;
      this._actualWrite = actualWriteBuffer;
      fsWriteSync = () => fs.writeSync(this.fd, this._writingBuf);
      fsWrite = () => fs.write(this.fd, this._writingBuf, this.release);
    } else if (contentMode === undefined || contentMode === kContentModeUtf8) {
      this._writingBuf = "";
      this.write = write;
      this.flush = flush;
      this.flushSync = flushSync;
      this._actualWrite = actualWrite;
      fsWriteSync = () => fs.writeSync(this.fd, this._writingBuf, "utf8");
      fsWrite = () => fs.write(this.fd, this._writingBuf, "utf8", this.release);
    } else {
      throw new Error(`SonicBoom supports "${kContentModeUtf8}" and "${kContentModeBuffer}", but passed ${contentMode}`);
    }
    if (typeof fd === "number") {
      this.fd = fd;
      process.nextTick(() => this.emit("ready"));
    } else if (typeof fd === "string") {
      openFile(fd, this);
    } else {
      throw new Error("SonicBoom supports only file descriptors and files");
    }
    if (this.minLength >= this.maxWrite) {
      throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
    }
    this.release = (err, n) => {
      if (err) {
        if ((err.code === "EAGAIN" || err.code === "EBUSY") && this.retryEAGAIN(err, this._writingBuf.length, this._len - this._writingBuf.length)) {
          if (this.sync) {
            try {
              sleep(BUSY_WRITE_TIMEOUT);
              this.release(undefined, 0);
            } catch (err2) {
              this.release(err2);
            }
          } else {
            setTimeout(fsWrite, BUSY_WRITE_TIMEOUT);
          }
        } else {
          this._writing = false;
          this.emit("error", err);
        }
        return;
      }
      this.emit("write", n);
      const releasedBufObj = releaseWritingBuf(this._writingBuf, this._len, n);
      this._len = releasedBufObj.len;
      this._writingBuf = releasedBufObj.writingBuf;
      if (this._writingBuf.length) {
        if (!this.sync) {
          fsWrite();
          return;
        }
        try {
          do {
            const n2 = fsWriteSync();
            const releasedBufObj2 = releaseWritingBuf(this._writingBuf, this._len, n2);
            this._len = releasedBufObj2.len;
            this._writingBuf = releasedBufObj2.writingBuf;
          } while (this._writingBuf.length);
        } catch (err2) {
          this.release(err2);
          return;
        }
      }
      if (this._fsync) {
        fs.fsyncSync(this.fd);
      }
      const len = this._len;
      if (this._reopening) {
        this._writing = false;
        this._reopening = false;
        this.reopen();
      } else if (len > this.minLength) {
        this._actualWrite();
      } else if (this._ending) {
        if (len > 0) {
          this._actualWrite();
        } else {
          this._writing = false;
          actualClose(this);
        }
      } else {
        this._writing = false;
        if (this.sync) {
          if (!this._asyncDrainScheduled) {
            this._asyncDrainScheduled = true;
            process.nextTick(emitDrain, this);
          }
        } else {
          this.emit("drain");
        }
      }
    };
    this.on("newListener", function(name) {
      if (name === "drain") {
        this._asyncDrainScheduled = false;
      }
    });
  }
  function releaseWritingBuf(writingBuf, len, n) {
    if (typeof writingBuf === "string" && Buffer.byteLength(writingBuf) !== n) {
      n = Buffer.from(writingBuf).subarray(0, n).toString().length;
    }
    len = Math.max(len - n, 0);
    writingBuf = writingBuf.slice(n);
    return { writingBuf, len };
  }
  function emitDrain(sonic) {
    const hasListeners = sonic.listenerCount("drain") > 0;
    if (!hasListeners)
      return;
    sonic._asyncDrainScheduled = false;
    sonic.emit("drain");
  }
  inherits2(SonicBoom, EventEmitter2);
  function mergeBuf(bufs, len) {
    if (bufs.length === 0) {
      return kEmptyBuffer;
    }
    if (bufs.length === 1) {
      return bufs[0];
    }
    return Buffer.concat(bufs, len);
  }
  function write(data) {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    const len = this._len + data.length;
    const bufs = this._bufs;
    if (this.maxLength && len > this.maxLength) {
      this.emit("drop", data);
      return this._len < this._hwm;
    }
    if (bufs.length === 0 || bufs[bufs.length - 1].length + data.length > this.maxWrite) {
      bufs.push("" + data);
    } else {
      bufs[bufs.length - 1] += data;
    }
    this._len = len;
    if (!this._writing && this._len >= this.minLength) {
      this._actualWrite();
    }
    return this._len < this._hwm;
  }
  function writeBuffer(data) {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    const len = this._len + data.length;
    const bufs = this._bufs;
    const lens = this._lens;
    if (this.maxLength && len > this.maxLength) {
      this.emit("drop", data);
      return this._len < this._hwm;
    }
    if (bufs.length === 0 || lens[lens.length - 1] + data.length > this.maxWrite) {
      bufs.push([data]);
      lens.push(data.length);
    } else {
      bufs[bufs.length - 1].push(data);
      lens[lens.length - 1] += data.length;
    }
    this._len = len;
    if (!this._writing && this._len >= this.minLength) {
      this._actualWrite();
    }
    return this._len < this._hwm;
  }
  function callFlushCallbackOnDrain(cb) {
    this._flushPending = true;
    const onDrain = () => {
      if (!this._fsync) {
        fs.fsync(this.fd, (err) => {
          this._flushPending = false;
          cb(err);
        });
      } else {
        this._flushPending = false;
        cb();
      }
      this.off("error", onError);
    };
    const onError = (err) => {
      this._flushPending = false;
      cb(err);
      this.off("drain", onDrain);
    };
    this.once("drain", onDrain);
    this.once("error", onError);
  }
  function flush(cb) {
    if (cb != null && typeof cb !== "function") {
      throw new Error("flush cb must be a function");
    }
    if (this.destroyed) {
      const error = new Error("SonicBoom destroyed");
      if (cb) {
        cb(error);
        return;
      }
      throw error;
    }
    if (this.minLength <= 0) {
      cb?.();
      return;
    }
    if (cb) {
      callFlushCallbackOnDrain.call(this, cb);
    }
    if (this._writing) {
      return;
    }
    if (this._bufs.length === 0) {
      this._bufs.push("");
    }
    this._actualWrite();
  }
  function flushBuffer(cb) {
    if (cb != null && typeof cb !== "function") {
      throw new Error("flush cb must be a function");
    }
    if (this.destroyed) {
      const error = new Error("SonicBoom destroyed");
      if (cb) {
        cb(error);
        return;
      }
      throw error;
    }
    if (this.minLength <= 0) {
      cb?.();
      return;
    }
    if (cb) {
      callFlushCallbackOnDrain.call(this, cb);
    }
    if (this._writing) {
      return;
    }
    if (this._bufs.length === 0) {
      this._bufs.push([]);
      this._lens.push(0);
    }
    this._actualWrite();
  }
  SonicBoom.prototype.reopen = function(file) {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this._opening) {
      this.once("ready", () => {
        this.reopen(file);
      });
      return;
    }
    if (this._ending) {
      return;
    }
    if (!this.file) {
      throw new Error("Unable to reopen a file descriptor, you must pass a file to SonicBoom");
    }
    if (file) {
      this.file = file;
    }
    this._reopening = true;
    if (this._writing) {
      return;
    }
    const fd = this.fd;
    this.once("ready", () => {
      if (fd !== this.fd) {
        fs.close(fd, (err) => {
          if (err) {
            return this.emit("error", err);
          }
        });
      }
    });
    openFile(this.file, this);
  };
  SonicBoom.prototype.end = function() {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this._opening) {
      this.once("ready", () => {
        this.end();
      });
      return;
    }
    if (this._ending) {
      return;
    }
    this._ending = true;
    if (this._writing) {
      return;
    }
    if (this._len > 0 && this.fd >= 0) {
      this._actualWrite();
    } else {
      actualClose(this);
    }
  };
  function flushSync() {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this.fd < 0) {
      throw new Error("sonic boom is not ready yet");
    }
    if (!this._writing && this._writingBuf.length > 0) {
      this._bufs.unshift(this._writingBuf);
      this._writingBuf = "";
    }
    let buf = "";
    while (this._bufs.length || buf) {
      if (buf.length <= 0) {
        buf = this._bufs[0];
      }
      try {
        const n = fs.writeSync(this.fd, buf, "utf8");
        const releasedBufObj = releaseWritingBuf(buf, this._len, n);
        buf = releasedBufObj.writingBuf;
        this._len = releasedBufObj.len;
        if (buf.length <= 0) {
          this._bufs.shift();
        }
      } catch (err) {
        const shouldRetry = err.code === "EAGAIN" || err.code === "EBUSY";
        if (shouldRetry && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) {
          throw err;
        }
        sleep(BUSY_WRITE_TIMEOUT);
      }
    }
    try {
      fs.fsyncSync(this.fd);
    } catch {}
  }
  function flushBufferSync() {
    if (this.destroyed) {
      throw new Error("SonicBoom destroyed");
    }
    if (this.fd < 0) {
      throw new Error("sonic boom is not ready yet");
    }
    if (!this._writing && this._writingBuf.length > 0) {
      this._bufs.unshift([this._writingBuf]);
      this._writingBuf = kEmptyBuffer;
    }
    let buf = kEmptyBuffer;
    while (this._bufs.length || buf.length) {
      if (buf.length <= 0) {
        buf = mergeBuf(this._bufs[0], this._lens[0]);
      }
      try {
        const n = fs.writeSync(this.fd, buf);
        buf = buf.subarray(n);
        this._len = Math.max(this._len - n, 0);
        if (buf.length <= 0) {
          this._bufs.shift();
          this._lens.shift();
        }
      } catch (err) {
        const shouldRetry = err.code === "EAGAIN" || err.code === "EBUSY";
        if (shouldRetry && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) {
          throw err;
        }
        sleep(BUSY_WRITE_TIMEOUT);
      }
    }
  }
  SonicBoom.prototype.destroy = function() {
    if (this.destroyed) {
      return;
    }
    actualClose(this);
  };
  function actualWrite() {
    const release = this.release;
    this._writing = true;
    this._writingBuf = this._writingBuf || this._bufs.shift() || "";
    if (this.sync) {
      try {
        const written = fs.writeSync(this.fd, this._writingBuf, "utf8");
        release(null, written);
      } catch (err) {
        release(err);
      }
    } else {
      fs.write(this.fd, this._writingBuf, "utf8", release);
    }
  }
  function actualWriteBuffer() {
    const release = this.release;
    this._writing = true;
    this._writingBuf = this._writingBuf.length ? this._writingBuf : mergeBuf(this._bufs.shift(), this._lens.shift());
    if (this.sync) {
      try {
        const written = fs.writeSync(this.fd, this._writingBuf);
        release(null, written);
      } catch (err) {
        release(err);
      }
    } else {
      fs.write(this.fd, this._writingBuf, release);
    }
  }
  function actualClose(sonic) {
    if (sonic.fd === -1) {
      sonic.once("ready", actualClose.bind(null, sonic));
      return;
    }
    sonic.destroyed = true;
    sonic._bufs = [];
    sonic._lens = [];
    fs.fsync(sonic.fd, closeWrapped);
    function closeWrapped() {
      if (sonic.fd !== 1 && sonic.fd !== 2) {
        fs.close(sonic.fd, done);
      } else {
        done();
      }
    }
    function done(err) {
      if (err) {
        sonic.emit("error", err);
        return;
      }
      if (sonic._ending && !sonic._writing) {
        sonic.emit("finish");
      }
      sonic.emit("close");
    }
  }
  SonicBoom.SonicBoom = SonicBoom;
  SonicBoom.default = SonicBoom;
  module.exports = SonicBoom;
});

// node_modules/on-exit-leak-free/index.js
var require_on_exit_leak_free = __commonJS((exports, module) => {
  var refs = {
    exit: [],
    beforeExit: []
  };
  var functions = {
    exit: onExit,
    beforeExit: onBeforeExit
  };
  var registry;
  function ensureRegistry() {
    if (registry === undefined) {
      registry = new FinalizationRegistry(clear);
    }
  }
  function install(event) {
    if (refs[event].length > 0) {
      return;
    }
    process.on(event, functions[event]);
  }
  function uninstall(event) {
    if (refs[event].length > 0) {
      return;
    }
    process.removeListener(event, functions[event]);
    if (refs.exit.length === 0 && refs.beforeExit.length === 0) {
      registry = undefined;
    }
  }
  function onExit() {
    callRefs("exit");
  }
  function onBeforeExit() {
    callRefs("beforeExit");
  }
  function callRefs(event) {
    for (const ref of refs[event]) {
      const obj = ref.deref();
      const fn = ref.fn;
      if (obj !== undefined) {
        fn(obj, event);
      }
    }
    refs[event] = [];
  }
  function clear(ref) {
    for (const event of ["exit", "beforeExit"]) {
      const index = refs[event].indexOf(ref);
      refs[event].splice(index, index + 1);
      uninstall(event);
    }
  }
  function _register(event, obj, fn) {
    if (obj === undefined) {
      throw new Error("the object can't be undefined");
    }
    install(event);
    const ref = new WeakRef(obj);
    ref.fn = fn;
    ensureRegistry();
    registry.register(obj, ref);
    refs[event].push(ref);
  }
  function register(obj, fn) {
    _register("exit", obj, fn);
  }
  function registerBeforeExit(obj, fn) {
    _register("beforeExit", obj, fn);
  }
  function unregister(obj) {
    if (registry === undefined) {
      return;
    }
    registry.unregister(obj);
    for (const event of ["exit", "beforeExit"]) {
      refs[event] = refs[event].filter((ref) => {
        const _obj = ref.deref();
        return _obj && _obj !== obj;
      });
      uninstall(event);
    }
  }
  module.exports = {
    register,
    registerBeforeExit,
    unregister
  };
});

// node_modules/thread-stream/package.json
var require_package2 = __commonJS((exports, module) => {
  module.exports = {
    name: "thread-stream",
    version: "2.7.0",
    description: "A streaming way to send data to a Node.js Worker Thread",
    main: "index.js",
    types: "index.d.ts",
    dependencies: {
      "real-require": "^0.2.0"
    },
    devDependencies: {
      "@types/node": "^20.1.0",
      "@types/tap": "^15.0.0",
      "@yao-pkg/pkg": "^5.11.5",
      desm: "^1.3.0",
      fastbench: "^1.0.1",
      husky: "^9.0.6",
      "pino-elasticsearch": "^8.0.0",
      "sonic-boom": "^3.0.0",
      standard: "^17.0.0",
      tap: "^16.2.0",
      "ts-node": "^10.8.0",
      typescript: "^5.3.2",
      "why-is-node-running": "^2.2.2"
    },
    scripts: {
      test: 'standard && npm run transpile && tap "test/**/*.test.*js" && tap --ts test/*.test.*ts',
      "test:ci": "standard && npm run transpile && npm run test:ci:js && npm run test:ci:ts",
      "test:ci:js": 'tap --no-check-coverage --timeout=120 --coverage-report=lcovonly "test/**/*.test.*js"',
      "test:ci:ts": 'tap --ts --no-check-coverage --coverage-report=lcovonly "test/**/*.test.*ts"',
      "test:yarn": 'npm run transpile && tap "test/**/*.test.js" --no-check-coverage',
      transpile: "sh ./test/ts/transpile.sh",
      prepare: "husky install"
    },
    standard: {
      ignore: [
        "test/ts/**/*"
      ]
    },
    repository: {
      type: "git",
      url: "git+https://github.com/mcollina/thread-stream.git"
    },
    keywords: [
      "worker",
      "thread",
      "threads",
      "stream"
    ],
    author: "Matteo Collina <hello@matteocollina.com>",
    license: "MIT",
    bugs: {
      url: "https://github.com/mcollina/thread-stream/issues"
    },
    homepage: "https://github.com/mcollina/thread-stream#readme"
  };
});

// node_modules/thread-stream/lib/wait.js
var require_wait = __commonJS((exports, module) => {
  var MAX_TIMEOUT = 1000;
  function wait(state, index, expected, timeout, done) {
    const max = Date.now() + timeout;
    let current = Atomics.load(state, index);
    if (current === expected) {
      done(null, "ok");
      return;
    }
    let prior = current;
    const check = (backoff) => {
      if (Date.now() > max) {
        done(null, "timed-out");
      } else {
        setTimeout(() => {
          prior = current;
          current = Atomics.load(state, index);
          if (current === prior) {
            check(backoff >= MAX_TIMEOUT ? MAX_TIMEOUT : backoff * 2);
          } else {
            if (current === expected)
              done(null, "ok");
            else
              done(null, "not-equal");
          }
        }, backoff);
      }
    };
    check(1);
  }
  function waitDiff(state, index, expected, timeout, done) {
    const max = Date.now() + timeout;
    let current = Atomics.load(state, index);
    if (current !== expected) {
      done(null, "ok");
      return;
    }
    const check = (backoff) => {
      if (Date.now() > max) {
        done(null, "timed-out");
      } else {
        setTimeout(() => {
          current = Atomics.load(state, index);
          if (current !== expected) {
            done(null, "ok");
          } else {
            check(backoff >= MAX_TIMEOUT ? MAX_TIMEOUT : backoff * 2);
          }
        }, backoff);
      }
    };
    check(1);
  }
  module.exports = { wait, waitDiff };
});

// node_modules/thread-stream/lib/indexes.js
var require_indexes = __commonJS((exports, module) => {
  var WRITE_INDEX = 4;
  var READ_INDEX = 8;
  module.exports = {
    WRITE_INDEX,
    READ_INDEX
  };
});

// node_modules/thread-stream/index.js
var require_thread_stream = __commonJS((exports, module) => {
  var __dirname = "/Users/moon/guardant-new/guardant-worker-standalone/node_modules/thread-stream";
  var { version } = require_package2();
  var { EventEmitter: EventEmitter2 } = __require("events");
  var { Worker } = __require("worker_threads");
  var { join } = __require("path");
  var { pathToFileURL } = __require("url");
  var { wait } = require_wait();
  var {
    WRITE_INDEX,
    READ_INDEX
  } = require_indexes();
  var buffer = __require("buffer");
  var assert = __require("assert");
  var kImpl = Symbol("kImpl");
  var MAX_STRING = buffer.constants.MAX_STRING_LENGTH;

  class FakeWeakRef {
    constructor(value) {
      this._value = value;
    }
    deref() {
      return this._value;
    }
  }

  class FakeFinalizationRegistry {
    register() {}
    unregister() {}
  }
  var FinalizationRegistry2 = process.env.NODE_V8_COVERAGE ? FakeFinalizationRegistry : global.FinalizationRegistry || FakeFinalizationRegistry;
  var WeakRef2 = process.env.NODE_V8_COVERAGE ? FakeWeakRef : global.WeakRef || FakeWeakRef;
  var registry = new FinalizationRegistry2((worker) => {
    if (worker.exited) {
      return;
    }
    worker.terminate();
  });
  function createWorker(stream4, opts) {
    const { filename, workerData } = opts;
    const bundlerOverrides = "__bundlerPathsOverrides" in globalThis ? globalThis.__bundlerPathsOverrides : {};
    const toExecute = bundlerOverrides["thread-stream-worker"] || join(__dirname, "lib", "worker.js");
    const worker = new Worker(toExecute, {
      ...opts.workerOpts,
      trackUnmanagedFds: false,
      workerData: {
        filename: filename.indexOf("file://") === 0 ? filename : pathToFileURL(filename).href,
        dataBuf: stream4[kImpl].dataBuf,
        stateBuf: stream4[kImpl].stateBuf,
        workerData: {
          $context: {
            threadStreamVersion: version
          },
          ...workerData
        }
      }
    });
    worker.stream = new FakeWeakRef(stream4);
    worker.on("message", onWorkerMessage);
    worker.on("exit", onWorkerExit);
    registry.register(stream4, worker);
    return worker;
  }
  function drain(stream4) {
    assert(!stream4[kImpl].sync);
    if (stream4[kImpl].needDrain) {
      stream4[kImpl].needDrain = false;
      stream4.emit("drain");
    }
  }
  function nextFlush(stream4) {
    const writeIndex = Atomics.load(stream4[kImpl].state, WRITE_INDEX);
    let leftover = stream4[kImpl].data.length - writeIndex;
    if (leftover > 0) {
      if (stream4[kImpl].buf.length === 0) {
        stream4[kImpl].flushing = false;
        if (stream4[kImpl].ending) {
          end(stream4);
        } else if (stream4[kImpl].needDrain) {
          process.nextTick(drain, stream4);
        }
        return;
      }
      let toWrite = stream4[kImpl].buf.slice(0, leftover);
      let toWriteBytes = Buffer.byteLength(toWrite);
      if (toWriteBytes <= leftover) {
        stream4[kImpl].buf = stream4[kImpl].buf.slice(leftover);
        write(stream4, toWrite, nextFlush.bind(null, stream4));
      } else {
        stream4.flush(() => {
          if (stream4.destroyed) {
            return;
          }
          Atomics.store(stream4[kImpl].state, READ_INDEX, 0);
          Atomics.store(stream4[kImpl].state, WRITE_INDEX, 0);
          while (toWriteBytes > stream4[kImpl].data.length) {
            leftover = leftover / 2;
            toWrite = stream4[kImpl].buf.slice(0, leftover);
            toWriteBytes = Buffer.byteLength(toWrite);
          }
          stream4[kImpl].buf = stream4[kImpl].buf.slice(leftover);
          write(stream4, toWrite, nextFlush.bind(null, stream4));
        });
      }
    } else if (leftover === 0) {
      if (writeIndex === 0 && stream4[kImpl].buf.length === 0) {
        return;
      }
      stream4.flush(() => {
        Atomics.store(stream4[kImpl].state, READ_INDEX, 0);
        Atomics.store(stream4[kImpl].state, WRITE_INDEX, 0);
        nextFlush(stream4);
      });
    } else {
      destroy(stream4, new Error("overwritten"));
    }
  }
  function onWorkerMessage(msg) {
    const stream4 = this.stream.deref();
    if (stream4 === undefined) {
      this.exited = true;
      this.terminate();
      return;
    }
    switch (msg.code) {
      case "READY":
        this.stream = new WeakRef2(stream4);
        stream4.flush(() => {
          stream4[kImpl].ready = true;
          stream4.emit("ready");
        });
        break;
      case "ERROR":
        destroy(stream4, msg.err);
        break;
      case "EVENT":
        if (Array.isArray(msg.args)) {
          stream4.emit(msg.name, ...msg.args);
        } else {
          stream4.emit(msg.name, msg.args);
        }
        break;
      case "WARNING":
        process.emitWarning(msg.err);
        break;
      default:
        destroy(stream4, new Error("this should not happen: " + msg.code));
    }
  }
  function onWorkerExit(code) {
    const stream4 = this.stream.deref();
    if (stream4 === undefined) {
      return;
    }
    registry.unregister(stream4);
    stream4.worker.exited = true;
    stream4.worker.off("exit", onWorkerExit);
    destroy(stream4, code !== 0 ? new Error("the worker thread exited") : null);
  }

  class ThreadStream extends EventEmitter2 {
    constructor(opts = {}) {
      super();
      if (opts.bufferSize < 4) {
        throw new Error("bufferSize must at least fit a 4-byte utf-8 char");
      }
      this[kImpl] = {};
      this[kImpl].stateBuf = new SharedArrayBuffer(128);
      this[kImpl].state = new Int32Array(this[kImpl].stateBuf);
      this[kImpl].dataBuf = new SharedArrayBuffer(opts.bufferSize || 4 * 1024 * 1024);
      this[kImpl].data = Buffer.from(this[kImpl].dataBuf);
      this[kImpl].sync = opts.sync || false;
      this[kImpl].ending = false;
      this[kImpl].ended = false;
      this[kImpl].needDrain = false;
      this[kImpl].destroyed = false;
      this[kImpl].flushing = false;
      this[kImpl].ready = false;
      this[kImpl].finished = false;
      this[kImpl].errored = null;
      this[kImpl].closed = false;
      this[kImpl].buf = "";
      this.worker = createWorker(this, opts);
      this.on("message", (message, transferList) => {
        this.worker.postMessage(message, transferList);
      });
    }
    write(data) {
      if (this[kImpl].destroyed) {
        error(this, new Error("the worker has exited"));
        return false;
      }
      if (this[kImpl].ending) {
        error(this, new Error("the worker is ending"));
        return false;
      }
      if (this[kImpl].flushing && this[kImpl].buf.length + data.length >= MAX_STRING) {
        try {
          writeSync(this);
          this[kImpl].flushing = true;
        } catch (err) {
          destroy(this, err);
          return false;
        }
      }
      this[kImpl].buf += data;
      if (this[kImpl].sync) {
        try {
          writeSync(this);
          return true;
        } catch (err) {
          destroy(this, err);
          return false;
        }
      }
      if (!this[kImpl].flushing) {
        this[kImpl].flushing = true;
        setImmediate(nextFlush, this);
      }
      this[kImpl].needDrain = this[kImpl].data.length - this[kImpl].buf.length - Atomics.load(this[kImpl].state, WRITE_INDEX) <= 0;
      return !this[kImpl].needDrain;
    }
    end() {
      if (this[kImpl].destroyed) {
        return;
      }
      this[kImpl].ending = true;
      end(this);
    }
    flush(cb) {
      if (this[kImpl].destroyed) {
        if (typeof cb === "function") {
          process.nextTick(cb, new Error("the worker has exited"));
        }
        return;
      }
      const writeIndex = Atomics.load(this[kImpl].state, WRITE_INDEX);
      wait(this[kImpl].state, READ_INDEX, writeIndex, Infinity, (err, res) => {
        if (err) {
          destroy(this, err);
          process.nextTick(cb, err);
          return;
        }
        if (res === "not-equal") {
          this.flush(cb);
          return;
        }
        process.nextTick(cb);
      });
    }
    flushSync() {
      if (this[kImpl].destroyed) {
        return;
      }
      writeSync(this);
      flushSync(this);
    }
    unref() {
      this.worker.unref();
    }
    ref() {
      this.worker.ref();
    }
    get ready() {
      return this[kImpl].ready;
    }
    get destroyed() {
      return this[kImpl].destroyed;
    }
    get closed() {
      return this[kImpl].closed;
    }
    get writable() {
      return !this[kImpl].destroyed && !this[kImpl].ending;
    }
    get writableEnded() {
      return this[kImpl].ending;
    }
    get writableFinished() {
      return this[kImpl].finished;
    }
    get writableNeedDrain() {
      return this[kImpl].needDrain;
    }
    get writableObjectMode() {
      return false;
    }
    get writableErrored() {
      return this[kImpl].errored;
    }
  }
  function error(stream4, err) {
    setImmediate(() => {
      stream4.emit("error", err);
    });
  }
  function destroy(stream4, err) {
    if (stream4[kImpl].destroyed) {
      return;
    }
    stream4[kImpl].destroyed = true;
    if (err) {
      stream4[kImpl].errored = err;
      error(stream4, err);
    }
    if (!stream4.worker.exited) {
      stream4.worker.terminate().catch(() => {}).then(() => {
        stream4[kImpl].closed = true;
        stream4.emit("close");
      });
    } else {
      setImmediate(() => {
        stream4[kImpl].closed = true;
        stream4.emit("close");
      });
    }
  }
  function write(stream4, data, cb) {
    const current = Atomics.load(stream4[kImpl].state, WRITE_INDEX);
    const length = Buffer.byteLength(data);
    stream4[kImpl].data.write(data, current);
    Atomics.store(stream4[kImpl].state, WRITE_INDEX, current + length);
    Atomics.notify(stream4[kImpl].state, WRITE_INDEX);
    cb();
    return true;
  }
  function end(stream4) {
    if (stream4[kImpl].ended || !stream4[kImpl].ending || stream4[kImpl].flushing) {
      return;
    }
    stream4[kImpl].ended = true;
    try {
      stream4.flushSync();
      let readIndex = Atomics.load(stream4[kImpl].state, READ_INDEX);
      Atomics.store(stream4[kImpl].state, WRITE_INDEX, -1);
      Atomics.notify(stream4[kImpl].state, WRITE_INDEX);
      let spins = 0;
      while (readIndex !== -1) {
        Atomics.wait(stream4[kImpl].state, READ_INDEX, readIndex, 1000);
        readIndex = Atomics.load(stream4[kImpl].state, READ_INDEX);
        if (readIndex === -2) {
          destroy(stream4, new Error("end() failed"));
          return;
        }
        if (++spins === 10) {
          destroy(stream4, new Error("end() took too long (10s)"));
          return;
        }
      }
      process.nextTick(() => {
        stream4[kImpl].finished = true;
        stream4.emit("finish");
      });
    } catch (err) {
      destroy(stream4, err);
    }
  }
  function writeSync(stream4) {
    const cb = () => {
      if (stream4[kImpl].ending) {
        end(stream4);
      } else if (stream4[kImpl].needDrain) {
        process.nextTick(drain, stream4);
      }
    };
    stream4[kImpl].flushing = false;
    while (stream4[kImpl].buf.length !== 0) {
      const writeIndex = Atomics.load(stream4[kImpl].state, WRITE_INDEX);
      let leftover = stream4[kImpl].data.length - writeIndex;
      if (leftover === 0) {
        flushSync(stream4);
        Atomics.store(stream4[kImpl].state, READ_INDEX, 0);
        Atomics.store(stream4[kImpl].state, WRITE_INDEX, 0);
        continue;
      } else if (leftover < 0) {
        throw new Error("overwritten");
      }
      let toWrite = stream4[kImpl].buf.slice(0, leftover);
      let toWriteBytes = Buffer.byteLength(toWrite);
      if (toWriteBytes <= leftover) {
        stream4[kImpl].buf = stream4[kImpl].buf.slice(leftover);
        write(stream4, toWrite, cb);
      } else {
        flushSync(stream4);
        Atomics.store(stream4[kImpl].state, READ_INDEX, 0);
        Atomics.store(stream4[kImpl].state, WRITE_INDEX, 0);
        while (toWriteBytes > stream4[kImpl].buf.length) {
          leftover = leftover / 2;
          toWrite = stream4[kImpl].buf.slice(0, leftover);
          toWriteBytes = Buffer.byteLength(toWrite);
        }
        stream4[kImpl].buf = stream4[kImpl].buf.slice(leftover);
        write(stream4, toWrite, cb);
      }
    }
  }
  function flushSync(stream4) {
    if (stream4[kImpl].flushing) {
      throw new Error("unable to flush while flushing");
    }
    const writeIndex = Atomics.load(stream4[kImpl].state, WRITE_INDEX);
    let spins = 0;
    while (true) {
      const readIndex = Atomics.load(stream4[kImpl].state, READ_INDEX);
      if (readIndex === -2) {
        throw Error("_flushSync failed");
      }
      if (readIndex !== writeIndex) {
        Atomics.wait(stream4[kImpl].state, READ_INDEX, readIndex, 1000);
      } else {
        break;
      }
      if (++spins === 10) {
        throw new Error("_flushSync took too long (10s)");
      }
    }
  }
  module.exports = ThreadStream;
});

// node_modules/pino/lib/transport.js
var require_transport = __commonJS((exports, module) => {
  var __dirname = "/Users/moon/guardant-new/guardant-worker-standalone/node_modules/pino/lib";
  var { createRequire: createRequire2 } = __require("module");
  var getCallers = require_caller();
  var { join, isAbsolute, sep } = __require("path");
  var sleep = require_atomic_sleep();
  var onExit = require_on_exit_leak_free();
  var ThreadStream = require_thread_stream();
  function setupOnExit(stream4) {
    onExit.register(stream4, autoEnd);
    onExit.registerBeforeExit(stream4, flush);
    stream4.on("close", function() {
      onExit.unregister(stream4);
    });
  }
  function buildStream(filename, workerData, workerOpts) {
    const stream4 = new ThreadStream({
      filename,
      workerData,
      workerOpts
    });
    stream4.on("ready", onReady);
    stream4.on("close", function() {
      process.removeListener("exit", onExit2);
    });
    process.on("exit", onExit2);
    function onReady() {
      process.removeListener("exit", onExit2);
      stream4.unref();
      if (workerOpts.autoEnd !== false) {
        setupOnExit(stream4);
      }
    }
    function onExit2() {
      if (stream4.closed) {
        return;
      }
      stream4.flushSync();
      sleep(100);
      stream4.end();
    }
    return stream4;
  }
  function autoEnd(stream4) {
    stream4.ref();
    stream4.flushSync();
    stream4.end();
    stream4.once("close", function() {
      stream4.unref();
    });
  }
  function flush(stream4) {
    stream4.flushSync();
  }
  function transport(fullOptions) {
    const { pipeline, targets, levels, dedupe, options = {}, worker = {}, caller = getCallers() } = fullOptions;
    const callers = typeof caller === "string" ? [caller] : caller;
    const bundlerOverrides = "__bundlerPathsOverrides" in globalThis ? globalThis.__bundlerPathsOverrides : {};
    let target = fullOptions.target;
    if (target && targets) {
      throw new Error("only one of target or targets can be specified");
    }
    if (targets) {
      target = bundlerOverrides["pino-worker"] || join(__dirname, "worker.js");
      options.targets = targets.map((dest) => {
        return {
          ...dest,
          target: fixTarget(dest.target)
        };
      });
    } else if (pipeline) {
      target = bundlerOverrides["pino-pipeline-worker"] || join(__dirname, "worker-pipeline.js");
      options.targets = pipeline.map((dest) => {
        return {
          ...dest,
          target: fixTarget(dest.target)
        };
      });
    }
    if (levels) {
      options.levels = levels;
    }
    if (dedupe) {
      options.dedupe = dedupe;
    }
    options.pinoWillSendConfig = true;
    return buildStream(fixTarget(target), options, worker);
    function fixTarget(origin2) {
      origin2 = bundlerOverrides[origin2] || origin2;
      if (isAbsolute(origin2) || origin2.indexOf("file://") === 0) {
        return origin2;
      }
      if (origin2 === "pino/file") {
        return join(__dirname, "..", "file.js");
      }
      let fixTarget2;
      for (const filePath of callers) {
        try {
          const context = filePath === "node:repl" ? process.cwd() + sep : filePath;
          fixTarget2 = createRequire2(context).resolve(origin2);
          break;
        } catch (err) {
          continue;
        }
      }
      if (!fixTarget2) {
        throw new Error(`unable to determine transport target for "${origin2}"`);
      }
      return fixTarget2;
    }
  }
  module.exports = transport;
});

// node_modules/pino/lib/tools.js
var require_tools = __commonJS((exports, module) => {
  var format = require_quick_format_unescaped();
  var { mapHttpRequest, mapHttpResponse } = require_pino_std_serializers();
  var SonicBoom = require_sonic_boom();
  var onExit = require_on_exit_leak_free();
  var {
    lsCacheSym,
    chindingsSym,
    writeSym,
    serializersSym,
    formatOptsSym,
    endSym,
    stringifiersSym,
    stringifySym,
    stringifySafeSym,
    wildcardFirstSym,
    nestedKeySym,
    formattersSym,
    messageKeySym,
    errorKeySym,
    nestedKeyStrSym,
    msgPrefixSym
  } = require_symbols();
  var { isMainThread } = __require("worker_threads");
  var transport = require_transport();
  function noop2() {}
  function genLog(level, hook) {
    if (!hook)
      return LOG;
    return function hookWrappedLog(...args) {
      hook.call(this, args, LOG, level);
    };
    function LOG(o, ...n) {
      if (typeof o === "object") {
        let msg = o;
        if (o !== null) {
          if (o.method && o.headers && o.socket) {
            o = mapHttpRequest(o);
          } else if (typeof o.setHeader === "function") {
            o = mapHttpResponse(o);
          }
        }
        let formatParams;
        if (msg === null && n.length === 0) {
          formatParams = [null];
        } else {
          msg = n.shift();
          formatParams = n;
        }
        if (typeof this[msgPrefixSym] === "string" && msg !== undefined && msg !== null) {
          msg = this[msgPrefixSym] + msg;
        }
        this[writeSym](o, format(msg, formatParams, this[formatOptsSym]), level);
      } else {
        let msg = o === undefined ? n.shift() : o;
        if (typeof this[msgPrefixSym] === "string" && msg !== undefined && msg !== null) {
          msg = this[msgPrefixSym] + msg;
        }
        this[writeSym](null, format(msg, n, this[formatOptsSym]), level);
      }
    }
  }
  function asString(str) {
    let result = "";
    let last = 0;
    let found = false;
    let point = 255;
    const l = str.length;
    if (l > 100) {
      return JSON.stringify(str);
    }
    for (var i = 0;i < l && point >= 32; i++) {
      point = str.charCodeAt(i);
      if (point === 34 || point === 92) {
        result += str.slice(last, i) + "\\";
        last = i;
        found = true;
      }
    }
    if (!found) {
      result = str;
    } else {
      result += str.slice(last);
    }
    return point < 32 ? JSON.stringify(str) : '"' + result + '"';
  }
  function asJson(obj, msg, num, time) {
    const stringify2 = this[stringifySym];
    const stringifySafe = this[stringifySafeSym];
    const stringifiers = this[stringifiersSym];
    const end = this[endSym];
    const chindings = this[chindingsSym];
    const serializers = this[serializersSym];
    const formatters = this[formattersSym];
    const messageKey = this[messageKeySym];
    const errorKey = this[errorKeySym];
    let data = this[lsCacheSym][num] + time;
    data = data + chindings;
    let value;
    if (formatters.log) {
      obj = formatters.log(obj);
    }
    const wildcardStringifier = stringifiers[wildcardFirstSym];
    let propStr = "";
    for (const key in obj) {
      value = obj[key];
      if (Object.prototype.hasOwnProperty.call(obj, key) && value !== undefined) {
        if (serializers[key]) {
          value = serializers[key](value);
        } else if (key === errorKey && serializers.err) {
          value = serializers.err(value);
        }
        const stringifier = stringifiers[key] || wildcardStringifier;
        switch (typeof value) {
          case "undefined":
          case "function":
            continue;
          case "number":
            if (Number.isFinite(value) === false) {
              value = null;
            }
          case "boolean":
            if (stringifier)
              value = stringifier(value);
            break;
          case "string":
            value = (stringifier || asString)(value);
            break;
          default:
            value = (stringifier || stringify2)(value, stringifySafe);
        }
        if (value === undefined)
          continue;
        const strKey = asString(key);
        propStr += "," + strKey + ":" + value;
      }
    }
    let msgStr = "";
    if (msg !== undefined) {
      value = serializers[messageKey] ? serializers[messageKey](msg) : msg;
      const stringifier = stringifiers[messageKey] || wildcardStringifier;
      switch (typeof value) {
        case "function":
          break;
        case "number":
          if (Number.isFinite(value) === false) {
            value = null;
          }
        case "boolean":
          if (stringifier)
            value = stringifier(value);
          msgStr = ',"' + messageKey + '":' + value;
          break;
        case "string":
          value = (stringifier || asString)(value);
          msgStr = ',"' + messageKey + '":' + value;
          break;
        default:
          value = (stringifier || stringify2)(value, stringifySafe);
          msgStr = ',"' + messageKey + '":' + value;
      }
    }
    if (this[nestedKeySym] && propStr) {
      return data + this[nestedKeyStrSym] + propStr.slice(1) + "}" + msgStr + end;
    } else {
      return data + propStr + msgStr + end;
    }
  }
  function asChindings(instance, bindings) {
    let value;
    let data = instance[chindingsSym];
    const stringify2 = instance[stringifySym];
    const stringifySafe = instance[stringifySafeSym];
    const stringifiers = instance[stringifiersSym];
    const wildcardStringifier = stringifiers[wildcardFirstSym];
    const serializers = instance[serializersSym];
    const formatter = instance[formattersSym].bindings;
    bindings = formatter(bindings);
    for (const key in bindings) {
      value = bindings[key];
      const valid = key !== "level" && key !== "serializers" && key !== "formatters" && key !== "customLevels" && bindings.hasOwnProperty(key) && value !== undefined;
      if (valid === true) {
        value = serializers[key] ? serializers[key](value) : value;
        value = (stringifiers[key] || wildcardStringifier || stringify2)(value, stringifySafe);
        if (value === undefined)
          continue;
        data += ',"' + key + '":' + value;
      }
    }
    return data;
  }
  function hasBeenTampered(stream4) {
    return stream4.write !== stream4.constructor.prototype.write;
  }
  var hasNodeCodeCoverage = process.env.NODE_V8_COVERAGE || process.env.V8_COVERAGE;
  function buildSafeSonicBoom(opts) {
    const stream4 = new SonicBoom(opts);
    stream4.on("error", filterBrokenPipe);
    if (!hasNodeCodeCoverage && !opts.sync && isMainThread) {
      onExit.register(stream4, autoEnd);
      stream4.on("close", function() {
        onExit.unregister(stream4);
      });
    }
    return stream4;
    function filterBrokenPipe(err) {
      if (err.code === "EPIPE") {
        stream4.write = noop2;
        stream4.end = noop2;
        stream4.flushSync = noop2;
        stream4.destroy = noop2;
        return;
      }
      stream4.removeListener("error", filterBrokenPipe);
      stream4.emit("error", err);
    }
  }
  function autoEnd(stream4, eventName) {
    if (stream4.destroyed) {
      return;
    }
    if (eventName === "beforeExit") {
      stream4.flush();
      stream4.on("drain", function() {
        stream4.end();
      });
    } else {
      stream4.flushSync();
    }
  }
  function createArgsNormalizer(defaultOptions) {
    return function normalizeArgs(instance, caller, opts = {}, stream4) {
      if (typeof opts === "string") {
        stream4 = buildSafeSonicBoom({ dest: opts });
        opts = {};
      } else if (typeof stream4 === "string") {
        if (opts && opts.transport) {
          throw Error("only one of option.transport or stream can be specified");
        }
        stream4 = buildSafeSonicBoom({ dest: stream4 });
      } else if (opts instanceof SonicBoom || opts.writable || opts._writableState) {
        stream4 = opts;
        opts = {};
      } else if (opts.transport) {
        if (opts.transport instanceof SonicBoom || opts.transport.writable || opts.transport._writableState) {
          throw Error("option.transport do not allow stream, please pass to option directly. e.g. pino(transport)");
        }
        if (opts.transport.targets && opts.transport.targets.length && opts.formatters && typeof opts.formatters.level === "function") {
          throw Error("option.transport.targets do not allow custom level formatters");
        }
        let customLevels;
        if (opts.customLevels) {
          customLevels = opts.useOnlyCustomLevels ? opts.customLevels : Object.assign({}, opts.levels, opts.customLevels);
        }
        stream4 = transport({ caller, ...opts.transport, levels: customLevels });
      }
      opts = Object.assign({}, defaultOptions, opts);
      opts.serializers = Object.assign({}, defaultOptions.serializers, opts.serializers);
      opts.formatters = Object.assign({}, defaultOptions.formatters, opts.formatters);
      if (opts.prettyPrint) {
        throw new Error("prettyPrint option is no longer supported, see the pino-pretty package (https://github.com/pinojs/pino-pretty)");
      }
      const { enabled, onChild } = opts;
      if (enabled === false)
        opts.level = "silent";
      if (!onChild)
        opts.onChild = noop2;
      if (!stream4) {
        if (!hasBeenTampered(process.stdout)) {
          stream4 = buildSafeSonicBoom({ fd: process.stdout.fd || 1 });
        } else {
          stream4 = process.stdout;
        }
      }
      return { opts, stream: stream4 };
    };
  }
  function stringify(obj, stringifySafeFn) {
    try {
      return JSON.stringify(obj);
    } catch (_) {
      try {
        const stringify2 = stringifySafeFn || this[stringifySafeSym];
        return stringify2(obj);
      } catch (_2) {
        return '"[unable to serialize, circular reference is too complex to analyze]"';
      }
    }
  }
  function buildFormatters(level, bindings, log) {
    return {
      level,
      bindings,
      log
    };
  }
  function normalizeDestFileDescriptor(destination) {
    const fd = Number(destination);
    if (typeof destination === "string" && Number.isFinite(fd)) {
      return fd;
    }
    if (destination === undefined) {
      return 1;
    }
    return destination;
  }
  module.exports = {
    noop: noop2,
    buildSafeSonicBoom,
    asChindings,
    asJson,
    genLog,
    createArgsNormalizer,
    stringify,
    buildFormatters,
    normalizeDestFileDescriptor
  };
});

// node_modules/pino/lib/constants.js
var require_constants = __commonJS((exports, module) => {
  var DEFAULT_LEVELS = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
  };
  var SORTING_ORDER = {
    ASC: "ASC",
    DESC: "DESC"
  };
  module.exports = {
    DEFAULT_LEVELS,
    SORTING_ORDER
  };
});

// node_modules/pino/lib/levels.js
var require_levels = __commonJS((exports, module) => {
  var {
    lsCacheSym,
    levelValSym,
    useOnlyCustomLevelsSym,
    streamSym,
    formattersSym,
    hooksSym,
    levelCompSym
  } = require_symbols();
  var { noop: noop2, genLog } = require_tools();
  var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
  var levelMethods = {
    fatal: (hook) => {
      const logFatal = genLog(DEFAULT_LEVELS.fatal, hook);
      return function(...args) {
        const stream4 = this[streamSym];
        logFatal.call(this, ...args);
        if (typeof stream4.flushSync === "function") {
          try {
            stream4.flushSync();
          } catch (e) {}
        }
      };
    },
    error: (hook) => genLog(DEFAULT_LEVELS.error, hook),
    warn: (hook) => genLog(DEFAULT_LEVELS.warn, hook),
    info: (hook) => genLog(DEFAULT_LEVELS.info, hook),
    debug: (hook) => genLog(DEFAULT_LEVELS.debug, hook),
    trace: (hook) => genLog(DEFAULT_LEVELS.trace, hook)
  };
  var nums = Object.keys(DEFAULT_LEVELS).reduce((o, k) => {
    o[DEFAULT_LEVELS[k]] = k;
    return o;
  }, {});
  var initialLsCache = Object.keys(nums).reduce((o, k) => {
    o[k] = '{"level":' + Number(k);
    return o;
  }, {});
  function genLsCache(instance) {
    const formatter = instance[formattersSym].level;
    const { labels } = instance.levels;
    const cache = {};
    for (const label in labels) {
      const level = formatter(labels[label], Number(label));
      cache[label] = JSON.stringify(level).slice(0, -1);
    }
    instance[lsCacheSym] = cache;
    return instance;
  }
  function isStandardLevel(level, useOnlyCustomLevels) {
    if (useOnlyCustomLevels) {
      return false;
    }
    switch (level) {
      case "fatal":
      case "error":
      case "warn":
      case "info":
      case "debug":
      case "trace":
        return true;
      default:
        return false;
    }
  }
  function setLevel(level) {
    const { labels, values } = this.levels;
    if (typeof level === "number") {
      if (labels[level] === undefined)
        throw Error("unknown level value" + level);
      level = labels[level];
    }
    if (values[level] === undefined)
      throw Error("unknown level " + level);
    const preLevelVal = this[levelValSym];
    const levelVal = this[levelValSym] = values[level];
    const useOnlyCustomLevelsVal = this[useOnlyCustomLevelsSym];
    const levelComparison = this[levelCompSym];
    const hook = this[hooksSym].logMethod;
    for (const key in values) {
      if (levelComparison(values[key], levelVal) === false) {
        this[key] = noop2;
        continue;
      }
      this[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](hook) : genLog(values[key], hook);
    }
    this.emit("level-change", level, levelVal, labels[preLevelVal], preLevelVal, this);
  }
  function getLevel(level) {
    const { levels, levelVal } = this;
    return levels && levels.labels ? levels.labels[levelVal] : "";
  }
  function isLevelEnabled(logLevel) {
    const { values } = this.levels;
    const logLevelVal = values[logLevel];
    return logLevelVal !== undefined && this[levelCompSym](logLevelVal, this[levelValSym]);
  }
  function compareLevel(direction, current, expected) {
    if (direction === SORTING_ORDER.DESC) {
      return current <= expected;
    }
    return current >= expected;
  }
  function genLevelComparison(levelComparison) {
    if (typeof levelComparison === "string") {
      return compareLevel.bind(null, levelComparison);
    }
    return levelComparison;
  }
  function mappings(customLevels = null, useOnlyCustomLevels = false) {
    const customNums = customLevels ? Object.keys(customLevels).reduce((o, k) => {
      o[customLevels[k]] = k;
      return o;
    }, {}) : null;
    const labels = Object.assign(Object.create(Object.prototype, { Infinity: { value: "silent" } }), useOnlyCustomLevels ? null : nums, customNums);
    const values = Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels);
    return { labels, values };
  }
  function assertDefaultLevelFound(defaultLevel, customLevels, useOnlyCustomLevels) {
    if (typeof defaultLevel === "number") {
      const values = [].concat(Object.keys(customLevels || {}).map((key) => customLevels[key]), useOnlyCustomLevels ? [] : Object.keys(nums).map((level) => +level), Infinity);
      if (!values.includes(defaultLevel)) {
        throw Error(`default level:${defaultLevel} must be included in custom levels`);
      }
      return;
    }
    const labels = Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels);
    if (!(defaultLevel in labels)) {
      throw Error(`default level:${defaultLevel} must be included in custom levels`);
    }
  }
  function assertNoLevelCollisions(levels, customLevels) {
    const { labels, values } = levels;
    for (const k in customLevels) {
      if (k in values) {
        throw Error("levels cannot be overridden");
      }
      if (customLevels[k] in labels) {
        throw Error("pre-existing level values cannot be used for new levels");
      }
    }
  }
  function assertLevelComparison(levelComparison) {
    if (typeof levelComparison === "function") {
      return;
    }
    if (typeof levelComparison === "string" && Object.values(SORTING_ORDER).includes(levelComparison)) {
      return;
    }
    throw new Error('Levels comparison should be one of "ASC", "DESC" or "function" type');
  }
  module.exports = {
    initialLsCache,
    genLsCache,
    levelMethods,
    getLevel,
    setLevel,
    isLevelEnabled,
    mappings,
    assertNoLevelCollisions,
    assertDefaultLevelFound,
    genLevelComparison,
    assertLevelComparison
  };
});

// node_modules/pino/lib/meta.js
var require_meta = __commonJS((exports, module) => {
  module.exports = { version: "8.21.0" };
});

// node_modules/pino/lib/proto.js
var require_proto = __commonJS((exports, module) => {
  var { EventEmitter: EventEmitter2 } = __require("events");
  var {
    lsCacheSym,
    levelValSym,
    setLevelSym,
    getLevelSym,
    chindingsSym,
    parsedChindingsSym,
    mixinSym,
    asJsonSym,
    writeSym,
    mixinMergeStrategySym,
    timeSym,
    timeSliceIndexSym,
    streamSym,
    serializersSym,
    formattersSym,
    errorKeySym,
    messageKeySym,
    useOnlyCustomLevelsSym,
    needsMetadataGsym,
    redactFmtSym,
    stringifySym,
    formatOptsSym,
    stringifiersSym,
    msgPrefixSym
  } = require_symbols();
  var {
    getLevel,
    setLevel,
    isLevelEnabled,
    mappings,
    initialLsCache,
    genLsCache,
    assertNoLevelCollisions
  } = require_levels();
  var {
    asChindings,
    asJson,
    buildFormatters,
    stringify
  } = require_tools();
  var {
    version
  } = require_meta();
  var redaction = require_redaction();
  var constructor = class Pino {
  };
  var prototype3 = {
    constructor,
    child,
    bindings,
    setBindings,
    flush,
    isLevelEnabled,
    version,
    get level() {
      return this[getLevelSym]();
    },
    set level(lvl) {
      this[setLevelSym](lvl);
    },
    get levelVal() {
      return this[levelValSym];
    },
    set levelVal(n) {
      throw Error("levelVal is read-only");
    },
    [lsCacheSym]: initialLsCache,
    [writeSym]: write,
    [asJsonSym]: asJson,
    [getLevelSym]: getLevel,
    [setLevelSym]: setLevel
  };
  Object.setPrototypeOf(prototype3, EventEmitter2.prototype);
  module.exports = function() {
    return Object.create(prototype3);
  };
  var resetChildingsFormatter = (bindings2) => bindings2;
  function child(bindings2, options) {
    if (!bindings2) {
      throw Error("missing bindings for child Pino");
    }
    options = options || {};
    const serializers = this[serializersSym];
    const formatters = this[formattersSym];
    const instance = Object.create(this);
    if (options.hasOwnProperty("serializers") === true) {
      instance[serializersSym] = Object.create(null);
      for (const k in serializers) {
        instance[serializersSym][k] = serializers[k];
      }
      const parentSymbols = Object.getOwnPropertySymbols(serializers);
      for (var i = 0;i < parentSymbols.length; i++) {
        const ks = parentSymbols[i];
        instance[serializersSym][ks] = serializers[ks];
      }
      for (const bk in options.serializers) {
        instance[serializersSym][bk] = options.serializers[bk];
      }
      const bindingsSymbols = Object.getOwnPropertySymbols(options.serializers);
      for (var bi = 0;bi < bindingsSymbols.length; bi++) {
        const bks = bindingsSymbols[bi];
        instance[serializersSym][bks] = options.serializers[bks];
      }
    } else
      instance[serializersSym] = serializers;
    if (options.hasOwnProperty("formatters")) {
      const { level, bindings: chindings, log } = options.formatters;
      instance[formattersSym] = buildFormatters(level || formatters.level, chindings || resetChildingsFormatter, log || formatters.log);
    } else {
      instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
    }
    if (options.hasOwnProperty("customLevels") === true) {
      assertNoLevelCollisions(this.levels, options.customLevels);
      instance.levels = mappings(options.customLevels, instance[useOnlyCustomLevelsSym]);
      genLsCache(instance);
    }
    if (typeof options.redact === "object" && options.redact !== null || Array.isArray(options.redact)) {
      instance.redact = options.redact;
      const stringifiers = redaction(instance.redact, stringify);
      const formatOpts = { stringify: stringifiers[redactFmtSym] };
      instance[stringifySym] = stringify;
      instance[stringifiersSym] = stringifiers;
      instance[formatOptsSym] = formatOpts;
    }
    if (typeof options.msgPrefix === "string") {
      instance[msgPrefixSym] = (this[msgPrefixSym] || "") + options.msgPrefix;
    }
    instance[chindingsSym] = asChindings(instance, bindings2);
    const childLevel = options.level || this.level;
    instance[setLevelSym](childLevel);
    this.onChild(instance);
    return instance;
  }
  function bindings() {
    const chindings = this[chindingsSym];
    const chindingsJson = `{${chindings.substr(1)}}`;
    const bindingsFromJson = JSON.parse(chindingsJson);
    delete bindingsFromJson.pid;
    delete bindingsFromJson.hostname;
    return bindingsFromJson;
  }
  function setBindings(newBindings) {
    const chindings = asChindings(this, newBindings);
    this[chindingsSym] = chindings;
    delete this[parsedChindingsSym];
  }
  function defaultMixinMergeStrategy(mergeObject, mixinObject) {
    return Object.assign(mixinObject, mergeObject);
  }
  function write(_obj, msg, num) {
    const t = this[timeSym]();
    const mixin = this[mixinSym];
    const errorKey = this[errorKeySym];
    const messageKey = this[messageKeySym];
    const mixinMergeStrategy = this[mixinMergeStrategySym] || defaultMixinMergeStrategy;
    let obj;
    if (_obj === undefined || _obj === null) {
      obj = {};
    } else if (_obj instanceof Error) {
      obj = { [errorKey]: _obj };
      if (msg === undefined) {
        msg = _obj.message;
      }
    } else {
      obj = _obj;
      if (msg === undefined && _obj[messageKey] === undefined && _obj[errorKey]) {
        msg = _obj[errorKey].message;
      }
    }
    if (mixin) {
      obj = mixinMergeStrategy(obj, mixin(obj, num, this));
    }
    const s = this[asJsonSym](obj, msg, num, t);
    const stream4 = this[streamSym];
    if (stream4[needsMetadataGsym] === true) {
      stream4.lastLevel = num;
      stream4.lastObj = obj;
      stream4.lastMsg = msg;
      stream4.lastTime = t.slice(this[timeSliceIndexSym]);
      stream4.lastLogger = this;
    }
    stream4.write(s);
  }
  function noop2() {}
  function flush(cb) {
    if (cb != null && typeof cb !== "function") {
      throw Error("callback must be a function");
    }
    const stream4 = this[streamSym];
    if (typeof stream4.flush === "function") {
      stream4.flush(cb || noop2);
    } else if (cb)
      cb();
  }
});

// node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = __commonJS((exports, module) => {
  var { hasOwnProperty: hasOwnProperty2 } = Object.prototype;
  var stringify = configure();
  stringify.configure = configure;
  stringify.stringify = stringify;
  stringify.default = stringify;
  exports.stringify = stringify;
  exports.configure = configure;
  module.exports = stringify;
  var strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
  function strEscape(str) {
    if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) {
      return `"${str}"`;
    }
    return JSON.stringify(str);
  }
  function sort(array, comparator) {
    if (array.length > 200 || comparator) {
      return array.sort(comparator);
    }
    for (let i = 1;i < array.length; i++) {
      const currentValue = array[i];
      let position = i;
      while (position !== 0 && array[position - 1] > currentValue) {
        array[position] = array[position - 1];
        position--;
      }
      array[position] = currentValue;
    }
    return array;
  }
  var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array)), Symbol.toStringTag).get;
  function isTypedArrayWithEntries(value) {
    return typedArrayPrototypeGetSymbolToStringTag.call(value) !== undefined && value.length !== 0;
  }
  function stringifyTypedArray(array, separator, maximumBreadth) {
    if (array.length < maximumBreadth) {
      maximumBreadth = array.length;
    }
    const whitespace = separator === "," ? "" : " ";
    let res = `"0":${whitespace}${array[0]}`;
    for (let i = 1;i < maximumBreadth; i++) {
      res += `${separator}"${i}":${whitespace}${array[i]}`;
    }
    return res;
  }
  function getCircularValueOption(options) {
    if (hasOwnProperty2.call(options, "circularValue")) {
      const circularValue = options.circularValue;
      if (typeof circularValue === "string") {
        return `"${circularValue}"`;
      }
      if (circularValue == null) {
        return circularValue;
      }
      if (circularValue === Error || circularValue === TypeError) {
        return {
          toString() {
            throw new TypeError("Converting circular structure to JSON");
          }
        };
      }
      throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
    }
    return '"[Circular]"';
  }
  function getDeterministicOption(options) {
    let value;
    if (hasOwnProperty2.call(options, "deterministic")) {
      value = options.deterministic;
      if (typeof value !== "boolean" && typeof value !== "function") {
        throw new TypeError('The "deterministic" argument must be of type boolean or comparator function');
      }
    }
    return value === undefined ? true : value;
  }
  function getBooleanOption(options, key) {
    let value;
    if (hasOwnProperty2.call(options, key)) {
      value = options[key];
      if (typeof value !== "boolean") {
        throw new TypeError(`The "${key}" argument must be of type boolean`);
      }
    }
    return value === undefined ? true : value;
  }
  function getPositiveIntegerOption(options, key) {
    let value;
    if (hasOwnProperty2.call(options, key)) {
      value = options[key];
      if (typeof value !== "number") {
        throw new TypeError(`The "${key}" argument must be of type number`);
      }
      if (!Number.isInteger(value)) {
        throw new TypeError(`The "${key}" argument must be an integer`);
      }
      if (value < 1) {
        throw new RangeError(`The "${key}" argument must be >= 1`);
      }
    }
    return value === undefined ? Infinity : value;
  }
  function getItemCount(number) {
    if (number === 1) {
      return "1 item";
    }
    return `${number} items`;
  }
  function getUniqueReplacerSet(replacerArray) {
    const replacerSet = new Set;
    for (const value of replacerArray) {
      if (typeof value === "string" || typeof value === "number") {
        replacerSet.add(String(value));
      }
    }
    return replacerSet;
  }
  function getStrictOption(options) {
    if (hasOwnProperty2.call(options, "strict")) {
      const value = options.strict;
      if (typeof value !== "boolean") {
        throw new TypeError('The "strict" argument must be of type boolean');
      }
      if (value) {
        return (value2) => {
          let message = `Object can not safely be stringified. Received type ${typeof value2}`;
          if (typeof value2 !== "function")
            message += ` (${value2.toString()})`;
          throw new Error(message);
        };
      }
    }
  }
  function configure(options) {
    options = { ...options };
    const fail = getStrictOption(options);
    if (fail) {
      if (options.bigint === undefined) {
        options.bigint = false;
      }
      if (!("circularValue" in options)) {
        options.circularValue = Error;
      }
    }
    const circularValue = getCircularValueOption(options);
    const bigint = getBooleanOption(options, "bigint");
    const deterministic = getDeterministicOption(options);
    const comparator = typeof deterministic === "function" ? deterministic : undefined;
    const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
    const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
    function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
      let value = parent[key];
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      value = replacer.call(parent, key, value);
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          let join = ",";
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `
${indentation}`;
              join = `,
${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `
${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let whitespace = "";
          let separator = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,
${indentation}`;
            whitespace = " ";
          }
          const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (deterministic && !isTypedArrayWithEntries(value)) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (spacer !== "" && separator.length > 1) {
            res = `
${indentation}${res}
${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
      if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
        value = value.toJSON(key);
      }
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          let res = "";
          let join = ",";
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            if (spacer !== "") {
              indentation += spacer;
              res += `
${indentation}`;
              join = `,
${indentation}`;
            }
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += join;
            }
            const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            if (spacer !== "") {
              res += `
${originalIndentation}`;
            }
            stack.pop();
            return `[${res}]`;
          }
          stack.push(value);
          let whitespace = "";
          if (spacer !== "") {
            indentation += spacer;
            join = `,
${indentation}`;
            whitespace = " ";
          }
          let separator = "";
          for (const key2 of replacer) {
            const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
              separator = join;
            }
          }
          if (spacer !== "" && separator.length > 1) {
            res = `
${indentation}${res}
${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifyIndent(key, value, stack, spacer, indentation) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifyIndent(key, value, stack, spacer, indentation);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          const originalIndentation = indentation;
          if (Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            indentation += spacer;
            let res2 = `
${indentation}`;
            const join2 = `,
${indentation}`;
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              res2 += tmp2 !== undefined ? tmp2 : "null";
              res2 += join2;
            }
            const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
            res2 += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
            }
            res2 += `
${originalIndentation}`;
            stack.pop();
            return `[${res2}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          indentation += spacer;
          const join = `,
${indentation}`;
          let res = "";
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, join, maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = join;
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}: ${tmp}`;
              separator = join;
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
            separator = join;
          }
          if (separator !== "") {
            res = `
${indentation}${res}
${originalIndentation}`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringifySimple(key, value, stack) {
      switch (typeof value) {
        case "string":
          return strEscape(value);
        case "object": {
          if (value === null) {
            return "null";
          }
          if (typeof value.toJSON === "function") {
            value = value.toJSON(key);
            if (typeof value !== "object") {
              return stringifySimple(key, value, stack);
            }
            if (value === null) {
              return "null";
            }
          }
          if (stack.indexOf(value) !== -1) {
            return circularValue;
          }
          let res = "";
          const hasLength = value.length !== undefined;
          if (hasLength && Array.isArray(value)) {
            if (value.length === 0) {
              return "[]";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Array]"';
            }
            stack.push(value);
            const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
            let i = 0;
            for (;i < maximumValuesToStringify - 1; i++) {
              const tmp2 = stringifySimple(String(i), value[i], stack);
              res += tmp2 !== undefined ? tmp2 : "null";
              res += ",";
            }
            const tmp = stringifySimple(String(i), value[i], stack);
            res += tmp !== undefined ? tmp : "null";
            if (value.length - 1 > maximumBreadth) {
              const removedKeys = value.length - maximumBreadth - 1;
              res += `,"... ${getItemCount(removedKeys)} not stringified"`;
            }
            stack.pop();
            return `[${res}]`;
          }
          let keys = Object.keys(value);
          const keyLength = keys.length;
          if (keyLength === 0) {
            return "{}";
          }
          if (maximumDepth < stack.length + 1) {
            return '"[Object]"';
          }
          let separator = "";
          let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
          if (hasLength && isTypedArrayWithEntries(value)) {
            res += stringifyTypedArray(value, ",", maximumBreadth);
            keys = keys.slice(value.length);
            maximumPropertiesToStringify -= value.length;
            separator = ",";
          }
          if (deterministic) {
            keys = sort(keys, comparator);
          }
          stack.push(value);
          for (let i = 0;i < maximumPropertiesToStringify; i++) {
            const key2 = keys[i];
            const tmp = stringifySimple(key2, value[key2], stack);
            if (tmp !== undefined) {
              res += `${separator}${strEscape(key2)}:${tmp}`;
              separator = ",";
            }
          }
          if (keyLength > maximumBreadth) {
            const removedKeys = keyLength - maximumBreadth;
            res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
          }
          stack.pop();
          return `{${res}}`;
        }
        case "number":
          return isFinite(value) ? String(value) : fail ? fail(value) : "null";
        case "boolean":
          return value === true ? "true" : "false";
        case "undefined":
          return;
        case "bigint":
          if (bigint) {
            return String(value);
          }
        default:
          return fail ? fail(value) : undefined;
      }
    }
    function stringify2(value, replacer, space) {
      if (arguments.length > 1) {
        let spacer = "";
        if (typeof space === "number") {
          spacer = " ".repeat(Math.min(space, 10));
        } else if (typeof space === "string") {
          spacer = space.slice(0, 10);
        }
        if (replacer != null) {
          if (typeof replacer === "function") {
            return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
          }
          if (Array.isArray(replacer)) {
            return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
          }
        }
        if (spacer.length !== 0) {
          return stringifyIndent("", value, [], spacer, "");
        }
      }
      return stringifySimple("", value, []);
    }
    return stringify2;
  }
});

// node_modules/pino/lib/multistream.js
var require_multistream = __commonJS((exports, module) => {
  var metadata = Symbol.for("pino.metadata");
  var { DEFAULT_LEVELS } = require_constants();
  var DEFAULT_INFO_LEVEL = DEFAULT_LEVELS.info;
  function multistream(streamsArray, opts) {
    let counter = 0;
    streamsArray = streamsArray || [];
    opts = opts || { dedupe: false };
    const streamLevels = Object.create(DEFAULT_LEVELS);
    streamLevels.silent = Infinity;
    if (opts.levels && typeof opts.levels === "object") {
      Object.keys(opts.levels).forEach((i) => {
        streamLevels[i] = opts.levels[i];
      });
    }
    const res = {
      write,
      add,
      emit,
      flushSync,
      end,
      minLevel: 0,
      streams: [],
      clone,
      [metadata]: true,
      streamLevels
    };
    if (Array.isArray(streamsArray)) {
      streamsArray.forEach(add, res);
    } else {
      add.call(res, streamsArray);
    }
    streamsArray = null;
    return res;
    function write(data) {
      let dest;
      const level = this.lastLevel;
      const { streams } = this;
      let recordedLevel = 0;
      let stream4;
      for (let i = initLoopVar(streams.length, opts.dedupe);checkLoopVar(i, streams.length, opts.dedupe); i = adjustLoopVar(i, opts.dedupe)) {
        dest = streams[i];
        if (dest.level <= level) {
          if (recordedLevel !== 0 && recordedLevel !== dest.level) {
            break;
          }
          stream4 = dest.stream;
          if (stream4[metadata]) {
            const { lastTime, lastMsg, lastObj, lastLogger } = this;
            stream4.lastLevel = level;
            stream4.lastTime = lastTime;
            stream4.lastMsg = lastMsg;
            stream4.lastObj = lastObj;
            stream4.lastLogger = lastLogger;
          }
          stream4.write(data);
          if (opts.dedupe) {
            recordedLevel = dest.level;
          }
        } else if (!opts.dedupe) {
          break;
        }
      }
    }
    function emit(...args) {
      for (const { stream: stream4 } of this.streams) {
        if (typeof stream4.emit === "function") {
          stream4.emit(...args);
        }
      }
    }
    function flushSync() {
      for (const { stream: stream4 } of this.streams) {
        if (typeof stream4.flushSync === "function") {
          stream4.flushSync();
        }
      }
    }
    function add(dest) {
      if (!dest) {
        return res;
      }
      const isStream2 = typeof dest.write === "function" || dest.stream;
      const stream_ = dest.write ? dest : dest.stream;
      if (!isStream2) {
        throw Error("stream object needs to implement either StreamEntry or DestinationStream interface");
      }
      const { streams, streamLevels: streamLevels2 } = this;
      let level;
      if (typeof dest.levelVal === "number") {
        level = dest.levelVal;
      } else if (typeof dest.level === "string") {
        level = streamLevels2[dest.level];
      } else if (typeof dest.level === "number") {
        level = dest.level;
      } else {
        level = DEFAULT_INFO_LEVEL;
      }
      const dest_ = {
        stream: stream_,
        level,
        levelVal: undefined,
        id: counter++
      };
      streams.unshift(dest_);
      streams.sort(compareByLevel);
      this.minLevel = streams[0].level;
      return res;
    }
    function end() {
      for (const { stream: stream4 } of this.streams) {
        if (typeof stream4.flushSync === "function") {
          stream4.flushSync();
        }
        stream4.end();
      }
    }
    function clone(level) {
      const streams = new Array(this.streams.length);
      for (let i = 0;i < streams.length; i++) {
        streams[i] = {
          level,
          stream: this.streams[i].stream
        };
      }
      return {
        write,
        add,
        minLevel: level,
        streams,
        clone,
        emit,
        flushSync,
        [metadata]: true
      };
    }
  }
  function compareByLevel(a, b) {
    return a.level - b.level;
  }
  function initLoopVar(length, dedupe) {
    return dedupe ? length - 1 : 0;
  }
  function adjustLoopVar(i, dedupe) {
    return dedupe ? i - 1 : i + 1;
  }
  function checkLoopVar(i, length, dedupe) {
    return dedupe ? i >= 0 : i < length;
  }
  module.exports = multistream;
});

// node_modules/pino/pino.js
var require_pino = __commonJS((exports, module) => {
  var os = __require("os");
  var stdSerializers = require_pino_std_serializers();
  var caller = require_caller();
  var redaction = require_redaction();
  var time = require_time();
  var proto = require_proto();
  var symbols = require_symbols();
  var { configure } = require_safe_stable_stringify();
  var { assertDefaultLevelFound, mappings, genLsCache, genLevelComparison, assertLevelComparison } = require_levels();
  var { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
  var {
    createArgsNormalizer,
    asChindings,
    buildSafeSonicBoom,
    buildFormatters,
    stringify,
    normalizeDestFileDescriptor,
    noop: noop2
  } = require_tools();
  var { version } = require_meta();
  var {
    chindingsSym,
    redactFmtSym,
    serializersSym,
    timeSym,
    timeSliceIndexSym,
    streamSym,
    stringifySym,
    stringifySafeSym,
    stringifiersSym,
    setLevelSym,
    endSym,
    formatOptsSym,
    messageKeySym,
    errorKeySym,
    nestedKeySym,
    mixinSym,
    levelCompSym,
    useOnlyCustomLevelsSym,
    formattersSym,
    hooksSym,
    nestedKeyStrSym,
    mixinMergeStrategySym,
    msgPrefixSym
  } = symbols;
  var { epochTime, nullTime } = time;
  var { pid } = process;
  var hostname = os.hostname();
  var defaultErrorSerializer = stdSerializers.err;
  var defaultOptions = {
    level: "info",
    levelComparison: SORTING_ORDER.ASC,
    levels: DEFAULT_LEVELS,
    messageKey: "msg",
    errorKey: "err",
    nestedKey: null,
    enabled: true,
    base: { pid, hostname },
    serializers: Object.assign(Object.create(null), {
      err: defaultErrorSerializer
    }),
    formatters: Object.assign(Object.create(null), {
      bindings(bindings) {
        return bindings;
      },
      level(label, number) {
        return { level: number };
      }
    }),
    hooks: {
      logMethod: undefined
    },
    timestamp: epochTime,
    name: undefined,
    redact: null,
    customLevels: null,
    useOnlyCustomLevels: false,
    depthLimit: 5,
    edgeLimit: 100
  };
  var normalize = createArgsNormalizer(defaultOptions);
  var serializers = Object.assign(Object.create(null), stdSerializers);
  function pino(...args) {
    const instance = {};
    const { opts, stream: stream4 } = normalize(instance, caller(), ...args);
    const {
      redact,
      crlf,
      serializers: serializers2,
      timestamp,
      messageKey,
      errorKey,
      nestedKey,
      base,
      name,
      level,
      customLevels,
      levelComparison,
      mixin,
      mixinMergeStrategy,
      useOnlyCustomLevels,
      formatters,
      hooks,
      depthLimit,
      edgeLimit,
      onChild,
      msgPrefix
    } = opts;
    const stringifySafe = configure({
      maximumDepth: depthLimit,
      maximumBreadth: edgeLimit
    });
    const allFormatters = buildFormatters(formatters.level, formatters.bindings, formatters.log);
    const stringifyFn = stringify.bind({
      [stringifySafeSym]: stringifySafe
    });
    const stringifiers = redact ? redaction(redact, stringifyFn) : {};
    const formatOpts = redact ? { stringify: stringifiers[redactFmtSym] } : { stringify: stringifyFn };
    const end = "}" + (crlf ? `\r
` : `
`);
    const coreChindings = asChindings.bind(null, {
      [chindingsSym]: "",
      [serializersSym]: serializers2,
      [stringifiersSym]: stringifiers,
      [stringifySym]: stringify,
      [stringifySafeSym]: stringifySafe,
      [formattersSym]: allFormatters
    });
    let chindings = "";
    if (base !== null) {
      if (name === undefined) {
        chindings = coreChindings(base);
      } else {
        chindings = coreChindings(Object.assign({}, base, { name }));
      }
    }
    const time2 = timestamp instanceof Function ? timestamp : timestamp ? epochTime : nullTime;
    const timeSliceIndex = time2().indexOf(":") + 1;
    if (useOnlyCustomLevels && !customLevels)
      throw Error("customLevels is required if useOnlyCustomLevels is set true");
    if (mixin && typeof mixin !== "function")
      throw Error(`Unknown mixin type "${typeof mixin}" - expected "function"`);
    if (msgPrefix && typeof msgPrefix !== "string")
      throw Error(`Unknown msgPrefix type "${typeof msgPrefix}" - expected "string"`);
    assertDefaultLevelFound(level, customLevels, useOnlyCustomLevels);
    const levels = mappings(customLevels, useOnlyCustomLevels);
    if (typeof stream4.emit === "function") {
      stream4.emit("message", { code: "PINO_CONFIG", config: { levels, messageKey, errorKey } });
    }
    assertLevelComparison(levelComparison);
    const levelCompFunc = genLevelComparison(levelComparison);
    Object.assign(instance, {
      levels,
      [levelCompSym]: levelCompFunc,
      [useOnlyCustomLevelsSym]: useOnlyCustomLevels,
      [streamSym]: stream4,
      [timeSym]: time2,
      [timeSliceIndexSym]: timeSliceIndex,
      [stringifySym]: stringify,
      [stringifySafeSym]: stringifySafe,
      [stringifiersSym]: stringifiers,
      [endSym]: end,
      [formatOptsSym]: formatOpts,
      [messageKeySym]: messageKey,
      [errorKeySym]: errorKey,
      [nestedKeySym]: nestedKey,
      [nestedKeyStrSym]: nestedKey ? `,${JSON.stringify(nestedKey)}:{` : "",
      [serializersSym]: serializers2,
      [mixinSym]: mixin,
      [mixinMergeStrategySym]: mixinMergeStrategy,
      [chindingsSym]: chindings,
      [formattersSym]: allFormatters,
      [hooksSym]: hooks,
      silent: noop2,
      onChild,
      [msgPrefixSym]: msgPrefix
    });
    Object.setPrototypeOf(instance, proto());
    genLsCache(instance);
    instance[setLevelSym](level);
    return instance;
  }
  module.exports = pino;
  module.exports.destination = (dest = process.stdout.fd) => {
    if (typeof dest === "object") {
      dest.dest = normalizeDestFileDescriptor(dest.dest || process.stdout.fd);
      return buildSafeSonicBoom(dest);
    } else {
      return buildSafeSonicBoom({ dest: normalizeDestFileDescriptor(dest), minLength: 0 });
    }
  };
  module.exports.transport = require_transport();
  module.exports.multistream = require_multistream();
  module.exports.levels = mappings();
  module.exports.stdSerializers = serializers;
  module.exports.stdTimeFunctions = Object.assign({}, time);
  module.exports.symbols = symbols;
  module.exports.version = version;
  module.exports.default = pino;
  module.exports.pino = pino;
});

// src/geographic-worker.ts
var import_amqplib = __toESM(require_channel_api(), 1);

// node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// node_modules/axios/lib/utils.js
var { toString } = Object.prototype;
var { getPrototypeOf } = Object;
var { iterator, toStringTag } = Symbol;
var kindOf = ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));
var kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
var typeOfTest = (type) => (thing) => typeof thing === type;
var { isArray } = Array;
var isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
var isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
var isString = typeOfTest("string");
var isFunction = typeOfTest("function");
var isNumber = typeOfTest("number");
var isObject = (thing) => thing !== null && typeof thing === "object";
var isBoolean = (thing) => thing === true || thing === false;
var isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype = getPrototypeOf(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(toStringTag in val) && !(iterator in val);
};
var isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
var isDate = kindOfTest("Date");
var isFile = kindOfTest("File");
var isBlob = kindOfTest("Blob");
var isFileList = kindOfTest("FileList");
var isStream = (val) => isObject(val) && isFunction(val.pipe);
var isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
var isURLSearchParams = kindOfTest("URLSearchParams");
var [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length;i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0;i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
var _global = (() => {
  if (typeof globalThis !== "undefined")
    return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
var isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length;i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
var stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
var inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
var toFlatObject = (sourceObj, destObj, filter, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null)
    return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
var endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
var toArray = (thing) => {
  if (!thing)
    return null;
  if (isArray(thing))
    return thing;
  let i = thing.length;
  if (!isNumber(i))
    return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
var isTypedArray = ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
var forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
var matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
var isHTMLForm = kindOfTest("HTMLFormElement");
var toCamelCase = (str) => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
    return p1.toUpperCase() + p2;
  });
};
var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
var isRegExp = kindOfTest("RegExp");
var reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
var freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value))
      return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
var toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
var noop = () => {};
var toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
var toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = undefined;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
var isAsyncFn = kindOfTest("AsyncFunction");
var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(typeof setImmediate === "function", isFunction(_global.postMessage));
var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
var utils_default = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};

// node_modules/axios/lib/core/AxiosError.js
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils_default.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: utils_default.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
var prototype = AxiosError.prototype;
var descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, "isAxiosError", { value: true });
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype);
  utils_default.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  AxiosError.call(axiosError, error.message, code, config, request, response);
  axiosError.cause = error;
  axiosError.name = error.name;
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var AxiosError_default = AxiosError;

// node_modules/axios/lib/platform/node/classes/FormData.js
var import_form_data = __toESM(require_form_data(), 1);
var FormData_default = import_form_data.default;

// node_modules/axios/lib/helpers/toFormData.js
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path)
    return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (FormData_default || FormData);
  options = utils_default.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils_default.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null)
      return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (utils_default.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]", convertValue(el));
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils_default.isUndefined(value))
      return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(formData, el, utils_default.isString(key) ? key.trim() : key, path, exposedHelpers);
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var toFormData_default = toFormData;

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\x00"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype2 = AxiosURLSearchParams.prototype;
prototype2.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype2.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode);
  } : encode;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
var AxiosURLSearchParams_default = AxiosURLSearchParams;

// node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode2;
  if (utils_default.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}

// node_modules/axios/lib/core/InterceptorManager.js
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  forEach(fn) {
    utils_default.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
var InterceptorManager_default = InterceptorManager;

// node_modules/axios/lib/defaults/transitional.js
var transitional_default = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};

// node_modules/axios/lib/platform/node/index.js
import crypto from "crypto";

// node_modules/axios/lib/platform/node/classes/URLSearchParams.js
import url from "url";
var URLSearchParams_default = url.URLSearchParams;

// node_modules/axios/lib/platform/node/index.js
var ALPHA = "abcdefghijklmnopqrstuvwxyz";
var DIGIT = "0123456789";
var ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};
var generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = "";
  const { length } = alphabet;
  const randomValues = new Uint32Array(size);
  crypto.randomFillSync(randomValues);
  for (let i = 0;i < size; i++) {
    str += alphabet[randomValues[i] % length];
  }
  return str;
};
var node_default = {
  isNode: true,
  classes: {
    URLSearchParams: URLSearchParams_default,
    FormData: FormData_default,
    Blob: typeof Blob !== "undefined" && Blob || null
  },
  ALPHABET,
  generateString,
  protocols: ["http", "https", "file", "data"]
};

// node_modules/axios/lib/platform/common/utils.js
var exports_utils = {};
__export(exports_utils, {
  origin: () => origin,
  navigator: () => _navigator,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasBrowserEnv: () => hasBrowserEnv
});
var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
var _navigator = typeof navigator === "object" && navigator || undefined;
var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
var hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
var origin = hasBrowserEnv && window.location.href || "http://localhost";

// node_modules/axios/lib/platform/index.js
var platform_default = {
  ...exports_utils,
  ...node_default
};

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams, {
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}

// node_modules/axios/lib/helpers/formDataToJSON.js
function parsePropPath(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0;i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__")
      return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default = formDataToJSON;

// node_modules/axios/lib/defaults/index.js
function stringifySafely(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
var defaults = {
  transitional: transitional_default,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils_default.isObject(data);
    if (isObjectPayload && utils_default.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils_default.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
    }
    if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (utils_default.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils_default.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData_default(isFileList2 ? { "files[]": data } : data, _FormData && new _FormData, this.formSerializer);
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional && transitional.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform_default.classes.FormData,
    Blob: platform_default.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": undefined
    }
  }
};
utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
var defaults_default = defaults;

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf = utils_default.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var parseHeaders_default = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split(`
`).forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};

// node_modules/axios/lib/core/AxiosHeaders.js
var $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value))
    return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}

class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils_default.findKey(self2, lHeader);
      if (!key || self2[key] === undefined || _rewrite === true || _rewrite === undefined && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders_default(header), valueOrRewrite);
    } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils_default.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils_default.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils_default.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils_default.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils_default.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils_default.forEach(this, (value, header) => {
      const key = utils_default.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = Object.create(null);
    utils_default.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype3 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype3, _header);
        accessors[lHeader] = true;
      }
    }
    utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
}
AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils_default.freezeMethods(AxiosHeaders);
var AxiosHeaders_default = AxiosHeaders;

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });
  headers.normalize();
  return data;
}

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

// node_modules/axios/lib/cancel/CanceledError.js
function CanceledError(message, config, request) {
  AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils_default.inherits(CanceledError, AxiosError_default, {
  __CANCEL__: true
});
var CanceledError_default = CanceledError;

// node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError_default("Request failed with status code " + response.status, [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4], response.config, response.request, response));
  }
}

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url2) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
}

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}

// node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// node_modules/axios/lib/adapters/http.js
var import_proxy_from_env = __toESM(require_proxy_from_env(), 1);
var import_follow_redirects = __toESM(require_follow_redirects(), 1);
import http from "http";
import https from "https";
import util2 from "util";
import zlib from "zlib";

// node_modules/axios/lib/env/data.js
var VERSION = "1.11.0";

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url2) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url2);
  return match && match[1] || "";
}

// node_modules/axios/lib/helpers/fromDataURI.js
var DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;
function fromDataURI(uri, asBlob, options) {
  const _Blob = options && options.Blob || platform_default.classes.Blob;
  const protocol = parseProtocol(uri);
  if (asBlob === undefined && _Blob) {
    asBlob = true;
  }
  if (protocol === "data") {
    uri = protocol.length ? uri.slice(protocol.length + 1) : uri;
    const match = DATA_URL_PATTERN.exec(uri);
    if (!match) {
      throw new AxiosError_default("Invalid URL", AxiosError_default.ERR_INVALID_URL);
    }
    const mime = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? "base64" : "utf8");
    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError_default("Blob is not supported", AxiosError_default.ERR_NOT_SUPPORT);
      }
      return new _Blob([buffer], { type: mime });
    }
    return buffer;
  }
  throw new AxiosError_default("Unsupported protocol " + protocol, AxiosError_default.ERR_NOT_SUPPORT);
}

// node_modules/axios/lib/adapters/http.js
import stream3 from "stream";

// node_modules/axios/lib/helpers/AxiosTransformStream.js
import stream from "stream";
var kInternals = Symbol("internals");

class AxiosTransformStream extends stream.Transform {
  constructor(options) {
    options = utils_default.toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15
    }, null, (prop, source) => {
      return !utils_default.isUndefined(source[prop]);
    });
    super({
      readableHighWaterMark: options.chunkSize
    });
    const internals = this[kInternals] = {
      timeWindow: options.timeWindow,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };
    this.on("newListener", (event) => {
      if (event === "progress") {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });
  }
  _read(size) {
    const internals = this[kInternals];
    if (internals.onReadCallback) {
      internals.onReadCallback();
    }
    return super._read(size);
  }
  _transform(chunk, encoding, callback) {
    const internals = this[kInternals];
    const maxRate = internals.maxRate;
    const readableHighWaterMark = this.readableHighWaterMark;
    const timeWindow = internals.timeWindow;
    const divider = 1000 / timeWindow;
    const bytesThreshold = maxRate / divider;
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;
    const pushChunk = (_chunk, _callback) => {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;
      internals.isCaptured && this.emit("progress", internals.bytesSeen);
      if (this.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    };
    const transformChunk = (_chunk, _callback) => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;
      if (maxRate) {
        const now = Date.now();
        if (!internals.ts || (passed = now - internals.ts) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }
        bytesLeft = bytesThreshold - internals.bytes;
      }
      if (maxRate) {
        if (bytesLeft <= 0) {
          return setTimeout(() => {
            _callback(null, _chunk);
          }, timeWindow - passed);
        }
        if (bytesLeft < maxChunkSize) {
          maxChunkSize = bytesLeft;
        }
      }
      if (maxChunkSize && chunkSize > maxChunkSize && chunkSize - maxChunkSize > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }
      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };
    transformChunk(chunk, function transformNextChunk(err, _chunk) {
      if (err) {
        return callback(err);
      }
      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }
}
var AxiosTransformStream_default = AxiosTransformStream;

// node_modules/axios/lib/adapters/http.js
import { EventEmitter } from "events";

// node_modules/axios/lib/helpers/formDataToStream.js
import util from "util";
import { Readable } from "stream";

// node_modules/axios/lib/helpers/readBlob.js
var { asyncIterator } = Symbol;
var readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
};
var readBlob_default = readBlob;

// node_modules/axios/lib/helpers/formDataToStream.js
var BOUNDARY_ALPHABET = platform_default.ALPHABET.ALPHA_DIGIT + "-_";
var textEncoder = typeof TextEncoder === "function" ? new TextEncoder : new util.TextEncoder;
var CRLF = `\r
`;
var CRLF_BYTES = textEncoder.encode(CRLF);
var CRLF_BYTES_COUNT = 2;

class FormDataPart {
  constructor(name, value) {
    const { escapeName } = this.constructor;
    const isStringValue = utils_default.isString(value);
    let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${!isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ""}${CRLF}`;
    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }
    this.headers = textEncoder.encode(headers + CRLF);
    this.contentLength = isStringValue ? value.byteLength : value.size;
    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;
    this.name = name;
    this.value = value;
  }
  async* encode() {
    yield this.headers;
    const { value } = this;
    if (utils_default.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob_default(value);
    }
    yield CRLF_BYTES;
  }
  static escapeName(name) {
    return String(name).replace(/[\r\n"]/g, (match) => ({
      "\r": "%0D",
      "\n": "%0A",
      '"': "%22"
    })[match]);
  }
}
var formDataToStream = (form, headersHandler, options) => {
  const {
    tag = "form-data-boundary",
    size = 25,
    boundary = tag + "-" + platform_default.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};
  if (!utils_default.isFormData(form)) {
    throw TypeError("FormData instance required");
  }
  if (boundary.length < 1 || boundary.length > 70) {
    throw Error("boundary must be 10-70 characters long");
  }
  const boundaryBytes = textEncoder.encode("--" + boundary + CRLF);
  const footerBytes = textEncoder.encode("--" + boundary + "--" + CRLF);
  let contentLength = footerBytes.byteLength;
  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });
  contentLength += boundaryBytes.byteLength * parts.length;
  contentLength = utils_default.toFiniteNumber(contentLength);
  const computedHeaders = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`
  };
  if (Number.isFinite(contentLength)) {
    computedHeaders["Content-Length"] = contentLength;
  }
  headersHandler && headersHandler(computedHeaders);
  return Readable.from(async function* () {
    for (const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }
    yield footerBytes;
  }());
};
var formDataToStream_default = formDataToStream;

// node_modules/axios/lib/helpers/ZlibHeaderTransformStream.js
import stream2 from "stream";

class ZlibHeaderTransformStream extends stream2.Transform {
  __transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
  _transform(chunk, encoding, callback) {
    if (chunk.length !== 0) {
      this._transform = this.__transform;
      if (chunk[0] !== 120) {
        const header = Buffer.alloc(2);
        header[0] = 120;
        header[1] = 156;
        this.push(header, encoding);
      }
    }
    this.__transform(chunk, encoding, callback);
  }
}
var ZlibHeaderTransformStream_default = ZlibHeaderTransformStream;

// node_modules/axios/lib/helpers/callbackify.js
var callbackify = (fn, reducer) => {
  return utils_default.isAsyncFn(fn) ? function(...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
      }
    }, cb);
  } : fn;
};
var callbackify_default = callbackify;

// node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== undefined ? min : 1000;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
  };
}
var speedometer_default = speedometer;

// node_modules/axios/lib/helpers/throttle.js
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1000 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
var throttle_default = throttle;

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer_default(50, 250);
  return throttle_default((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
var progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
var asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));

// node_modules/axios/lib/adapters/http.js
var zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH
};
var brotliOptions = {
  flush: zlib.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
};
var isBrotliSupported = utils_default.isFunction(zlib.createBrotliDecompress);
var { http: httpFollow, https: httpsFollow } = import_follow_redirects.default;
var isHttps = /https:?/;
var supportedProtocols = platform_default.protocols.map((protocol) => {
  return protocol + ":";
});
var flushOnFinish = (stream4, [throttled, flush]) => {
  stream4.on("end", flush).on("error", flush);
  return throttled;
};
function dispatchBeforeRedirect(options, responseDetails) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options, responseDetails);
  }
}
function setProxy(options, configProxy, location) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = import_proxy_from_env.default.getProxyForUrl(location);
    if (proxyUrl) {
      proxy = new URL(proxyUrl);
    }
  }
  if (proxy) {
    if (proxy.username) {
      proxy.auth = (proxy.username || "") + ":" + (proxy.password || "");
    }
    if (proxy.auth) {
      if (proxy.auth.username || proxy.auth.password) {
        proxy.auth = (proxy.auth.username || "") + ":" + (proxy.auth.password || "");
      }
      const base64 = Buffer.from(proxy.auth, "utf8").toString("base64");
      options.headers["Proxy-Authorization"] = "Basic " + base64;
    }
    options.headers.host = options.hostname + (options.port ? ":" + options.port : "");
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(":") ? proxy.protocol : `${proxy.protocol}:`;
    }
  }
  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
}
var isHttpAdapterSupported = typeof process !== "undefined" && utils_default.kindOf(process) === "process";
var wrapAsync = (asyncExecutor) => {
  return new Promise((resolve, reject) => {
    let onDone;
    let isDone;
    const done = (value, isRejected) => {
      if (isDone)
        return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };
    const _resolve = (value) => {
      done(value);
      resolve(value);
    };
    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };
    asyncExecutor(_resolve, _reject, (onDoneHandler) => onDone = onDoneHandler).catch(_reject);
  });
};
var resolveFamily = ({ address, family }) => {
  if (!utils_default.isString(address)) {
    throw TypeError("address must be a string");
  }
  return {
    address,
    family: family || (address.indexOf(".") < 0 ? 6 : 4)
  };
};
var buildAddressEntry = (address, family) => resolveFamily(utils_default.isObject(address) ? address : { address, family });
var http_default = isHttpAdapterSupported && function httpAdapter(config) {
  return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
    let { data, lookup, family } = config;
    const { responseType, responseEncoding } = config;
    const method = config.method.toUpperCase();
    let isDone;
    let rejected = false;
    let req;
    if (lookup) {
      const _lookup = callbackify_default(lookup, (value) => utils_default.isArray(value) ? value : [value]);
      lookup = (hostname, opt, cb) => {
        _lookup(hostname, opt, (err, arg0, arg1) => {
          if (err) {
            return cb(err);
          }
          const addresses = utils_default.isArray(arg0) ? arg0.map((addr) => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];
          opt.all ? cb(err, addresses) : cb(err, addresses[0].address, addresses[0].family);
        });
      };
    }
    const emitter = new EventEmitter;
    const onFinished = () => {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(abort);
      }
      if (config.signal) {
        config.signal.removeEventListener("abort", abort);
      }
      emitter.removeAllListeners();
    };
    onDone((value, isRejected) => {
      isDone = true;
      if (isRejected) {
        rejected = true;
        onFinished();
      }
    });
    function abort(reason) {
      emitter.emit("abort", !reason || reason.type ? new CanceledError_default(null, config, req) : reason);
    }
    emitter.once("abort", reject);
    if (config.cancelToken || config.signal) {
      config.cancelToken && config.cancelToken.subscribe(abort);
      if (config.signal) {
        config.signal.aborted ? abort() : config.signal.addEventListener("abort", abort);
      }
    }
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    const parsed = new URL(fullPath, platform_default.hasBrowserEnv ? platform_default.origin : undefined);
    const protocol = parsed.protocol || supportedProtocols[0];
    if (protocol === "data:") {
      let convertedData;
      if (method !== "GET") {
        return settle(resolve, reject, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config
        });
      }
      try {
        convertedData = fromDataURI(config.url, responseType === "blob", {
          Blob: config.env && config.env.Blob
        });
      } catch (err) {
        throw AxiosError_default.from(err, AxiosError_default.ERR_BAD_REQUEST, config);
      }
      if (responseType === "text") {
        convertedData = convertedData.toString(responseEncoding);
        if (!responseEncoding || responseEncoding === "utf8") {
          convertedData = utils_default.stripBOM(convertedData);
        }
      } else if (responseType === "stream") {
        convertedData = stream3.Readable.from(convertedData);
      }
      return settle(resolve, reject, {
        data: convertedData,
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders_default,
        config
      });
    }
    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError_default("Unsupported protocol " + protocol, AxiosError_default.ERR_BAD_REQUEST, config));
    }
    const headers = AxiosHeaders_default.from(config.headers).normalize();
    headers.set("User-Agent", "axios/" + VERSION, false);
    const { onUploadProgress, onDownloadProgress } = config;
    const maxRate = config.maxRate;
    let maxUploadRate = undefined;
    let maxDownloadRate = undefined;
    if (utils_default.isSpecCompliantForm(data)) {
      const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);
      data = formDataToStream_default(data, (formHeaders) => {
        headers.set(formHeaders);
      }, {
        tag: `axios-${VERSION}-boundary`,
        boundary: userBoundary && userBoundary[1] || undefined
      });
    } else if (utils_default.isFormData(data) && utils_default.isFunction(data.getHeaders)) {
      headers.set(data.getHeaders());
      if (!headers.hasContentLength()) {
        try {
          const knownLength = await util2.promisify(data.getLength).call(data);
          Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
        } catch (e) {}
      }
    } else if (utils_default.isBlob(data) || utils_default.isFile(data)) {
      data.size && headers.setContentType(data.type || "application/octet-stream");
      headers.setContentLength(data.size || 0);
      data = stream3.Readable.from(readBlob_default(data));
    } else if (data && !utils_default.isStream(data)) {
      if (Buffer.isBuffer(data)) {} else if (utils_default.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils_default.isString(data)) {
        data = Buffer.from(data, "utf-8");
      } else {
        return reject(new AxiosError_default("Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream", AxiosError_default.ERR_BAD_REQUEST, config));
      }
      headers.setContentLength(data.length, false);
      if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
        return reject(new AxiosError_default("Request body larger than maxBodyLength limit", AxiosError_default.ERR_BAD_REQUEST, config));
      }
    }
    const contentLength = utils_default.toFiniteNumber(headers.getContentLength());
    if (utils_default.isArray(maxRate)) {
      maxUploadRate = maxRate[0];
      maxDownloadRate = maxRate[1];
    } else {
      maxUploadRate = maxDownloadRate = maxRate;
    }
    if (data && (onUploadProgress || maxUploadRate)) {
      if (!utils_default.isStream(data)) {
        data = stream3.Readable.from(data, { objectMode: false });
      }
      data = stream3.pipeline([data, new AxiosTransformStream_default({
        maxRate: utils_default.toFiniteNumber(maxUploadRate)
      })], utils_default.noop);
      onUploadProgress && data.on("progress", flushOnFinish(data, progressEventDecorator(contentLength, progressEventReducer(asyncDecorator(onUploadProgress), false, 3))));
    }
    let auth = undefined;
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password || "";
      auth = username + ":" + password;
    }
    if (!auth && parsed.username) {
      const urlUsername = parsed.username;
      const urlPassword = parsed.password;
      auth = urlUsername + ":" + urlPassword;
    }
    auth && headers.delete("authorization");
    let path;
    try {
      path = buildURL(parsed.pathname + parsed.search, config.params, config.paramsSerializer).replace(/^\?/, "");
    } catch (err) {
      const customErr = new Error(err.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      return reject(customErr);
    }
    headers.set("Accept-Encoding", "gzip, compress, deflate" + (isBrotliSupported ? ", br" : ""), false);
    const options = {
      path,
      method,
      headers: headers.toJSON(),
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth,
      protocol,
      family,
      beforeRedirect: dispatchBeforeRedirect,
      beforeRedirects: {}
    };
    !utils_default.isUndefined(lookup) && (options.lookup = lookup);
    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;
      options.port = parsed.port;
      setProxy(options, config.proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
    }
    let transport;
    const isHttpsRequest = isHttps.test(options.protocol);
    options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsRequest ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirects.config = config.beforeRedirect;
      }
      transport = isHttpsRequest ? httpsFollow : httpFollow;
    }
    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    } else {
      options.maxBodyLength = Infinity;
    }
    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }
    req = transport.request(options, function handleResponse(res) {
      if (req.destroyed)
        return;
      const streams = [res];
      const responseLength = +res.headers["content-length"];
      if (onDownloadProgress || maxDownloadRate) {
        const transformStream = new AxiosTransformStream_default({
          maxRate: utils_default.toFiniteNumber(maxDownloadRate)
        });
        onDownloadProgress && transformStream.on("progress", flushOnFinish(transformStream, progressEventDecorator(responseLength, progressEventReducer(asyncDecorator(onDownloadProgress), true, 3))));
        streams.push(transformStream);
      }
      let responseStream = res;
      const lastRequest = res.req || req;
      if (config.decompress !== false && res.headers["content-encoding"]) {
        if (method === "HEAD" || res.statusCode === 204) {
          delete res.headers["content-encoding"];
        }
        switch ((res.headers["content-encoding"] || "").toLowerCase()) {
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "deflate":
            streams.push(new ZlibHeaderTransformStream_default);
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "br":
            if (isBrotliSupported) {
              streams.push(zlib.createBrotliDecompress(brotliOptions));
              delete res.headers["content-encoding"];
            }
        }
      }
      responseStream = streams.length > 1 ? stream3.pipeline(streams, utils_default.noop) : streams[0];
      const offListeners = stream3.finished(responseStream, () => {
        offListeners();
        onFinished();
      });
      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new AxiosHeaders_default(res.headers),
        config,
        request: lastRequest
      };
      if (responseType === "stream") {
        response.data = responseStream;
        settle(resolve, reject, response);
      } else {
        const responseBuffer = [];
        let totalResponseBytes = 0;
        responseStream.on("data", function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            rejected = true;
            responseStream.destroy();
            reject(new AxiosError_default("maxContentLength size of " + config.maxContentLength + " exceeded", AxiosError_default.ERR_BAD_RESPONSE, config, lastRequest));
          }
        });
        responseStream.on("aborted", function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          const err = new AxiosError_default("stream has been aborted", AxiosError_default.ERR_BAD_RESPONSE, config, lastRequest);
          responseStream.destroy(err);
          reject(err);
        });
        responseStream.on("error", function handleStreamError(err) {
          if (req.destroyed)
            return;
          reject(AxiosError_default.from(err, null, config, lastRequest));
        });
        responseStream.on("end", function handleStreamEnd() {
          try {
            let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (responseType !== "arraybuffer") {
              responseData = responseData.toString(responseEncoding);
              if (!responseEncoding || responseEncoding === "utf8") {
                responseData = utils_default.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err) {
            return reject(AxiosError_default.from(err, null, config, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }
      emitter.once("abort", (err) => {
        if (!responseStream.destroyed) {
          responseStream.emit("error", err);
          responseStream.destroy();
        }
      });
    });
    emitter.once("abort", (err) => {
      reject(err);
      req.destroy(err);
    });
    req.on("error", function handleRequestError(err) {
      reject(AxiosError_default.from(err, null, config, req));
    });
    req.on("socket", function handleRequestSocket(socket) {
      socket.setKeepAlive(true, 1000 * 60);
    });
    if (config.timeout) {
      const timeout = parseInt(config.timeout, 10);
      if (Number.isNaN(timeout)) {
        reject(new AxiosError_default("error trying to parse `config.timeout` to int", AxiosError_default.ERR_BAD_OPTION_VALUE, config, req));
        return;
      }
      req.setTimeout(timeout, function handleRequestTimeout() {
        if (isDone)
          return;
        let timeoutErrorMessage = config.timeout ? "timeout of " + config.timeout + "ms exceeded" : "timeout exceeded";
        const transitional = config.transitional || transitional_default;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(new AxiosError_default(timeoutErrorMessage, transitional.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED, config, req));
        abort();
      });
    }
    if (utils_default.isStream(data)) {
      let ended = false;
      let errored = false;
      data.on("end", () => {
        ended = true;
      });
      data.once("error", (err) => {
        errored = true;
        req.destroy(err);
      });
      data.on("close", () => {
        if (!ended && !errored) {
          abort(new CanceledError_default("Request stream has been aborted", config, req));
        }
      });
      data.pipe(req);
    } else {
      req.end(data);
    }
  });
};

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? ((origin2, isMSIE) => (url2) => {
  url2 = new URL(url2, platform_default.origin);
  return origin2.protocol === url2.protocol && origin2.host === url2.host && (isMSIE || origin2.port === url2.port);
})(new URL(platform_default.origin), platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)) : () => true;

// node_modules/axios/lib/helpers/cookies.js
var cookies_default = platform_default.hasStandardBrowserEnv ? {
  write(name, value, expires, path, domain, secure) {
    const cookie = [name + "=" + encodeURIComponent(value)];
    utils_default.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
    utils_default.isString(path) && cookie.push("path=" + path);
    utils_default.isString(domain) && cookie.push("domain=" + domain);
    secure === true && cookie.push("secure");
    document.cookie = cookie.join("; ");
  },
  read(name) {
    const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
    return match ? decodeURIComponent(match[3]) : null;
  },
  remove(name) {
    this.write(name, "", Date.now() - 86400000);
  }
} : {
  write() {},
  read() {
    return null;
  },
  remove() {}
};

// node_modules/axios/lib/core/mergeConfig.js
var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(undefined, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}

// node_modules/axios/lib/helpers/resolveConfig.js
var resolveConfig_default = (config) => {
  const newConfig = mergeConfig({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders_default.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set("Authorization", "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : "")));
  }
  let contentType;
  if (utils_default.isFormData(data)) {
    if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(undefined);
    } else if ((contentType = headers.getContentType()) !== false) {
      const [type, ...tokens] = contentType ? contentType.split(";").map((token) => token.trim()).filter(Boolean) : [];
      headers.setContentType([type || "multipart/form-data", ...tokens].join("; "));
    }
  }
  if (platform_default.hasStandardBrowserEnv) {
    withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
var xhr_default = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig_default(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest;
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders_default.from("getAllResponseHeaders" in request && request.getAllResponseHeaders());
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError() {
      reject(new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request));
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional = _config.transitional || transitional_default;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError_default(timeoutErrorMessage, transitional.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED, config, request));
      request = null;
    };
    requestData === undefined && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils_default.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController;
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils_default.asap(unsubscribe);
    return signal;
  }
};
var composeSignals_default = composeSignals;

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
var readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
var readStream = async function* (stream4) {
  if (stream4[Symbol.asyncIterator]) {
    yield* stream4;
    return;
  }
  const reader = stream4.getReader();
  try {
    for (;; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
var trackStream = (stream4, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream4, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};

// node_modules/axios/lib/adapters/fetch.js
var isFetchSupported = typeof fetch === "function" && typeof Request === "function" && typeof Response === "function";
var isReadableStreamSupported = isFetchSupported && typeof ReadableStream === "function";
var encodeText = isFetchSupported && (typeof TextEncoder === "function" ? ((encoder) => (str) => encoder.encode(str))(new TextEncoder) : async (str) => new Uint8Array(await new Response(str).arrayBuffer()));
var test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
var supportsRequestStream = isReadableStreamSupported && test(() => {
  let duplexAccessed = false;
  const hasContentType = new Request(platform_default.origin, {
    body: new ReadableStream,
    method: "POST",
    get duplex() {
      duplexAccessed = true;
      return "half";
    }
  }).headers.has("Content-Type");
  return duplexAccessed && !hasContentType;
});
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var supportsResponseStream = isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
var resolvers = {
  stream: supportsResponseStream && ((res) => res.body)
};
isFetchSupported && ((res) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
    !resolvers[type] && (resolvers[type] = utils_default.isFunction(res[type]) ? (res2) => res2[type]() : (_, config) => {
      throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
    });
  });
})(new Response);
var getBodyLength = async (body) => {
  if (body == null) {
    return 0;
  }
  if (utils_default.isBlob(body)) {
    return body.size;
  }
  if (utils_default.isSpecCompliantForm(body)) {
    const _request = new Request(platform_default.origin, {
      method: "POST",
      body
    });
    return (await _request.arrayBuffer()).byteLength;
  }
  if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
    return body.byteLength;
  }
  if (utils_default.isURLSearchParams(body)) {
    body = body + "";
  }
  if (utils_default.isString(body)) {
    return (await encodeText(body)).byteLength;
  }
};
var resolveBodyLength = async (headers, body) => {
  const length = utils_default.toFiniteNumber(headers.getContentLength());
  return length == null ? getBodyLength(body) : length;
};
var fetch_default = isFetchSupported && (async (config) => {
  let {
    url: url2,
    method,
    data,
    signal,
    cancelToken,
    timeout,
    onDownloadProgress,
    onUploadProgress,
    responseType,
    headers,
    withCredentials = "same-origin",
    fetchOptions
  } = resolveConfig_default(config);
  responseType = responseType ? (responseType + "").toLowerCase() : "text";
  let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
  let request;
  const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
    composedSignal.unsubscribe();
  });
  let requestContentLength;
  try {
    if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
      let _request = new Request(url2, {
        method: "POST",
        body: data,
        duplex: "half"
      });
      let contentTypeHeader;
      if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
        headers.setContentType(contentTypeHeader);
      }
      if (_request.body) {
        const [onProgress, flush] = progressEventDecorator(requestContentLength, progressEventReducer(asyncDecorator(onUploadProgress)));
        data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
      }
    }
    if (!utils_default.isString(withCredentials)) {
      withCredentials = withCredentials ? "include" : "omit";
    }
    const isCredentialsSupported = "credentials" in Request.prototype;
    request = new Request(url2, {
      ...fetchOptions,
      signal: composedSignal,
      method: method.toUpperCase(),
      headers: headers.normalize().toJSON(),
      body: data,
      duplex: "half",
      credentials: isCredentialsSupported ? withCredentials : undefined
    });
    let response = await fetch(request, fetchOptions);
    const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
    if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
      const options = {};
      ["status", "statusText", "headers"].forEach((prop) => {
        options[prop] = response[prop];
      });
      const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
      const [onProgress, flush] = onDownloadProgress && progressEventDecorator(responseContentLength, progressEventReducer(asyncDecorator(onDownloadProgress), true)) || [];
      response = new Response(trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
        flush && flush();
        unsubscribe && unsubscribe();
      }), options);
    }
    responseType = responseType || "text";
    let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
    !isStreamResponse && unsubscribe && unsubscribe();
    return await new Promise((resolve, reject) => {
      settle(resolve, reject, {
        data: responseData,
        headers: AxiosHeaders_default.from(response.headers),
        status: response.status,
        statusText: response.statusText,
        config,
        request
      });
    });
  } catch (err) {
    unsubscribe && unsubscribe();
    if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
      throw Object.assign(new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request), {
        cause: err.cause || err
      });
    }
    throw AxiosError_default.from(err, err && err.code, config, request);
  }
});

// node_modules/axios/lib/adapters/adapters.js
var knownAdapters = {
  http: http_default,
  xhr: xhr_default,
  fetch: fetch_default
};
utils_default.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {}
    Object.defineProperty(fn, "adapterName", { value });
  }
});
var renderReason = (reason) => `- ${reason}`;
var isResolvedHandle = (adapter) => utils_default.isFunction(adapter) || adapter === null || adapter === false;
var adapters_default = {
  getAdapter: (adapters) => {
    adapters = utils_default.isArray(adapters) ? adapters : [adapters];
    const { length } = adapters;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0;i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === undefined) {
          throw new AxiosError_default(`Unknown adapter '${id}'`);
        }
      }
      if (adapter) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build"));
      let s = length ? reasons.length > 1 ? `since :
` + reasons.map(renderReason).join(`
`) : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError_default(`There is no suitable adapter to dispatch the request ` + s, "ERR_NOT_SUPPORT");
    }
    return adapter;
  },
  adapters: knownAdapters
};

// node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(config, config.transformRequest);
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters_default.getAdapter(config.adapter || defaults_default.adapter);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(config, config.transformResponse, response);
    response.headers = AxiosHeaders_default.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(config, config.transformResponse, reason.response);
        reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}

// node_modules/axios/lib/helpers/validator.js
var validators = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
var deprecatedWarnings = {};
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError_default(formatMessage(opt, " has been removed" + (version ? " in " + version : "")), AxiosError_default.ERR_DEPRECATED);
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
    }
    return validator ? validator(value, opt, opts) : true;
  };
};
validators.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validator_default = {
  assertOptions,
  validators
};

// node_modules/axios/lib/core/Axios.js
var validators2 = validator_default.validators;

class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager_default,
      response: new InterceptorManager_default
    };
  }
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error;
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += `
` + stack;
          }
        } catch (e) {}
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== undefined) {
      validator_default.assertOptions(transitional2, {
        silentJSONParsing: validators2.transitional(validators2.boolean),
        forcedJSONParsing: validators2.transitional(validators2.boolean),
        clarifyTimeoutError: validators2.transitional(validators2.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils_default.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator_default.assertOptions(paramsSerializer, {
          encode: validators2.function,
          serialize: validators2.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== undefined) {} else if (this.defaults.allowAbsoluteUrls !== undefined) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator_default.assertOptions(config, {
      baseUrl: validators2.spelling("baseURL"),
      withXsrfToken: validators2.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils_default.merge(headers.common, headers[config.method]);
    headers && utils_default.forEach(["delete", "get", "head", "post", "put", "patch", "common"], (method) => {
      delete headers[method];
    });
    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    i = 0;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
}
utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url2, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url: url2,
      data: (config || {}).data
    }));
  };
});
utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url2, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: url2,
        data
      }));
    };
  }
  Axios.prototype[method] = generateHTTPMethod();
  Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
var Axios_default = Axios;

// node_modules/axios/lib/cancel/CancelToken.js
class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners)
        return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError_default(message, config, request);
      resolvePromise(token.reason);
    });
  }
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController;
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
}
var CancelToken_default = CancelToken;

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});
var HttpStatusCode_default = HttpStatusCode;

// node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios = createInstance(defaults_default);
axios.Axios = Axios_default;
axios.CanceledError = CanceledError_default;
axios.CancelToken = CancelToken_default;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData_default;
axios.AxiosError = AxiosError_default;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders_default;
axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters_default.getAdapter;
axios.HttpStatusCode = HttpStatusCode_default;
axios.default = axios;
var axios_default = axios;

// src/logger.ts
var import_pino = __toESM(require_pino(), 1);
var logLevel = process.env.LOG_LEVEL || "info";
function createLogger(name) {
  return import_pino.default({
    name,
    level: logLevel,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname"
      }
    }
  });
}

// src/geographic-hierarchy.ts
class RoutingKeyBuilder {
  static buildKey(location, level) {
    const parts = [];
    if (location.continent)
      parts.push(location.continent);
    if (location.region)
      parts.push(location.region);
    if (location.country)
      parts.push(location.country);
    if (location.city)
      parts.push(location.city);
    if (location.workerId)
      parts.push(location.workerId);
    if (level && parts.length < 5) {
      parts.push("*");
    }
    return parts.join(".");
  }
  static parseKey(routingKey) {
    const parts = routingKey.split(".");
    const location = {};
    if (parts[0] && parts[0] !== "*")
      location.continent = parts[0];
    if (parts[1] && parts[1] !== "*")
      location.region = parts[1];
    if (parts[2] && parts[2] !== "*")
      location.country = parts[2];
    if (parts[3] && parts[3] !== "*")
      location.city = parts[3];
    if (parts[4] && parts[4] !== "*")
      location.workerId = parts[4];
    return location;
  }
  static getWorkerBindings(location) {
    return [
      `check.${location.continent}.${location.region}.${location.country}.${location.city}.${location.workerId}`,
      `check.${location.continent}.${location.region}.${location.country}.${location.city}.*`,
      `check.${location.continent}.${location.region}.${location.country}.*.*`,
      `check.${location.continent}.${location.region}.*.*.*`,
      `check.${location.continent}.*.*.*.*`,
      `check.*.*.*.*.*`
    ];
  }
}
var EXCHANGES = {
  CHECKS: "monitoring.checks",
  CLAIMS: "monitoring.claims",
  HEARTBEATS: "monitoring.heartbeats",
  REGISTRATION: "monitoring.registration",
  RESULTS: "monitoring.results"
};
var QUEUE_PREFIXES = {
  WORKER_CHECKS: "worker.checks.",
  WORKER_CLAIMS: "worker.claims.",
  SCHEDULER_HEARTBEATS: "scheduler.heartbeats",
  SCHEDULER_REGISTRATION: "scheduler.registration",
  SCHEDULER_RESULTS: "scheduler.results"
};

// src/geographic-worker.ts
var logger = createLogger("geographic-worker");

class GeographicWorker {
  config;
  connection = null;
  channel = null;
  registration;
  activeChecks = new Map;
  heartbeatInterval = null;
  HEARTBEAT_INTERVAL = 30000;
  CHECK_TIMEOUT = 30000;
  CLAIM_TIMEOUT = 2000;
  constructor(config) {
    this.config = config;
    this.registration = {
      workerId: config.workerId,
      location: config.location,
      capabilities: config.capabilities || ["http", "https"],
      version: config.version || "1.0.0",
      registeredAt: Date.now(),
      lastHeartbeat: Date.now()
    };
  }
  async start() {
    try {
      await this.connectToRabbitMQ();
      await this.setupExchanges();
      await this.setupQueues();
      await this.register();
      this.startHeartbeat();
      await this.listenForChecks();
      logger.info(`✅ Worker ${this.config.workerId} started`, {
        location: this.config.location
      });
    } catch (error) {
      logger.error("Failed to start worker", {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  }
  async connectToRabbitMQ() {
    this.connection = await import_amqplib.default.connect(this.config.rabbitmqUrl);
    this.connection.on("error", (err) => {
      logger.error("RabbitMQ connection error", err);
      this.reconnect();
    });
    this.connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
      this.reconnect();
    });
    this.channel = await this.connection.createChannel();
    logger.info("✅ Connected to RabbitMQ");
  }
  async reconnect() {
    logger.info("Attempting to reconnect...");
    setTimeout(() => this.start(), 5000);
  }
  async register() {
    if (!this.channel)
      throw new Error("Channel not initialized");
    let attempts = 0;
    const maxAttempts = 10;
    const ackTimeoutMs = 60000;
    while (attempts < maxAttempts) {
      attempts++;
      logger.info(`\uD83D\uDCE4 Sending registration (attempt ${attempts}/${maxAttempts})...`);
      const ackQueue = await this.channel.assertQueue("", { exclusive: true });
      const ackRoutingKey = `ack.${this.config.workerId}`;
      await this.channel.bindQueue(ackQueue.queue, EXCHANGES.REGISTRATION, ackRoutingKey);
      logger.info(`\uD83D\uDCEE ACK queue ready: ${ackQueue.queue} bound to ${EXCHANGES.REGISTRATION} with key: ${ackRoutingKey}`);
      await this.channel.publish(EXCHANGES.REGISTRATION, "register", Buffer.from(JSON.stringify(this.registration)));
      logger.info(`⏳ Waiting for ACK on ${ackRoutingKey} (timeout: ${ackTimeoutMs / 1000}s)`);
      const ackReceived = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          logger.warn(`⏱️ ACK timeout for ${this.config.workerId} after ${ackTimeoutMs / 1000} seconds (attempt ${attempts}/${maxAttempts})`);
          resolve(false);
        }, ackTimeoutMs);
        this.channel.consume(ackQueue.queue, (msg) => {
          logger.debug(`\uD83D\uDD14 Message received on ACK queue`);
          if (msg) {
            try {
              logger.debug(`\uD83D\uDCE6 Message details:`, {
                exchange: msg.fields.exchange,
                routingKey: msg.fields.routingKey,
                contentType: msg.properties.contentType
              });
              const ackData = JSON.parse(msg.content.toString());
              logger.info(`\uD83D\uDCE8 Received ACK:`, ackData);
              clearTimeout(timeout);
              this.channel.ack(msg);
              resolve(true);
            } catch (err) {
              logger.error(`❌ Failed to parse ACK message:`, err);
              logger.error(`Raw message:`, msg.content.toString());
            }
          } else {
            logger.debug(`⚠️ Null message received`);
          }
        }, { noAck: false }).then((result) => {
          logger.debug(`\uD83D\uDC42 Consumer started with tag: ${result.consumerTag}`);
        });
      });
      if (ackReceived) {
        logger.info(`✅ Worker registered with scheduler after ${attempts} attempt(s)`);
        return;
      }
      await this.channel.deleteQueue(ackQueue.queue);
      if (attempts < maxAttempts) {
        logger.warn(`⚠️ Registration not acknowledged, retrying in 10 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 1e4));
      }
    }
    logger.error(`❌ Failed to register after ${maxAttempts} attempts. Worker will continue without scheduler confirmation.`);
    logger.info(`\uD83D\uDCAA Worker proceeding in standalone mode - will process any incoming check requests`);
  }
  async setupExchanges() {
    if (!this.channel)
      throw new Error("Channel not initialized");
    const exchanges = [
      { name: EXCHANGES.CHECKS, type: "topic" },
      { name: EXCHANGES.CLAIMS, type: "direct" },
      { name: EXCHANGES.RESULTS, type: "topic" },
      { name: EXCHANGES.REGISTRATION, type: "topic" },
      { name: EXCHANGES.HEARTBEATS, type: "topic" }
    ];
    for (const ex of exchanges) {
      try {
        await this.channel.assertExchange(ex.name, ex.type, { durable: true });
        logger.debug(`Created/verified exchange ${ex.name} (${ex.type})`);
      } catch (error) {
        if (error.message && error.message.includes("inequivalent")) {
          logger.warn(`Exchange ${ex.name} exists with different type, using existing`);
        } else {
          logger.error(`Failed to create exchange ${ex.name}:`, error.message);
          throw error;
        }
      }
    }
    logger.info("✅ Exchanges configured");
  }
  async setupQueues() {
    if (!this.channel)
      throw new Error("Channel not initialized");
    const checkQueue = `${QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
    await this.channel.assertQueue(checkQueue, { durable: true });
    const bindings = RoutingKeyBuilder.getWorkerBindings(this.config.location);
    for (const binding of bindings) {
      await this.channel.bindQueue(checkQueue, EXCHANGES.CHECKS, binding);
      logger.debug(`Bound to routing key: ${binding}`);
    }
    const claimQueue = `${QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
    await this.channel.assertQueue(claimQueue, { durable: true });
    await this.channel.bindQueue(claimQueue, EXCHANGES.CLAIMS, `response.${this.config.workerId}`);
    logger.info(`✅ Queues and bindings configured`);
  }
  async listenForChecks() {
    if (!this.channel)
      throw new Error("Channel not initialized");
    const checkQueue = `${QUEUE_PREFIXES.WORKER_CHECKS}${this.config.workerId}`;
    await this.channel.consume(checkQueue, async (msg) => {
      if (!msg)
        return;
      try {
        const task = JSON.parse(msg.content.toString());
        logger.info(`\uD83D\uDCE5 Received check task ${task.id}`, {
          serviceId: task.serviceId,
          target: task.target
        });
        const claimed = await this.claimTask(task);
        if (!claimed) {
          logger.info(`❌ Task ${task.id} claimed by another worker, skipping`);
          this.channel.ack(msg);
          return;
        }
        const result = await this.executeCheck(task);
        await this.sendResult(task, result);
        this.channel.ack(msg);
      } catch (error) {
        logger.error("Failed to process check", error);
        this.channel.nack(msg, false, false);
      }
    });
    logger.info("\uD83D\uDC42 Listening for check tasks");
  }
  async claimTask(task) {
    if (!this.channel)
      throw new Error("Channel not initialized");
    const claimRequest = {
      taskId: task.id,
      workerId: this.config.workerId,
      timestamp: Date.now()
    };
    await this.channel.publish(EXCHANGES.CLAIMS, "request", Buffer.from(JSON.stringify(claimRequest)));
    const claimQueue = `${QUEUE_PREFIXES.WORKER_CLAIMS}${this.config.workerId}`;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.warn(`Claim timeout for task ${task.id}, proceeding anyway`);
        resolve(true);
      }, this.CLAIM_TIMEOUT);
      const consumer = this.channel.consume(claimQueue, (msg) => {
        if (!msg)
          return;
        try {
          const response = JSON.parse(msg.content.toString());
          if (response.taskId === task.id) {
            clearTimeout(timeout);
            this.channel.ack(msg);
            this.channel.cancel(consumer.consumerTag);
            resolve(response.approved);
          }
        } catch (error) {
          logger.error("Failed to parse claim response", error);
        }
      });
    });
  }
  async executeCheck(task) {
    const startTime = Date.now();
    try {
      const response = await axios_default({
        method: task.config?.method || "GET",
        url: task.target,
        timeout: this.CHECK_TIMEOUT,
        headers: task.config?.headers || {},
        validateStatus: () => true
      });
      const responseTime = Date.now() - startTime;
      return {
        status: response.status < 400 ? "up" : "down",
        statusCode: response.status,
        responseTime,
        timestamp: Date.now(),
        workerId: this.config.workerId,
        location: this.config.location
      };
    } catch (error) {
      return {
        status: "down",
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        workerId: this.config.workerId,
        location: this.config.location,
        error: error.message || "Check failed"
      };
    }
  }
  async sendResult(task, result) {
    if (!this.channel)
      throw new Error("Channel not initialized");
    const fullResult = {
      taskId: task.id,
      serviceId: task.serviceId,
      nestId: task.nestId,
      ...result
    };
    await this.channel.publish(EXCHANGES.RESULTS, `check.${this.config.workerId}`, Buffer.from(JSON.stringify(fullResult)), { persistent: true });
    logger.info(`✅ Result sent for task ${task.id}`, {
      status: result.status,
      responseTime: result.responseTime
    });
  }
  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (!this.channel)
        return;
      try {
        const heartbeatData = {
          workerId: this.config.workerId,
          location: this.config.location,
          timestamp: Date.now(),
          lastSeen: Date.now(),
          activeChecks: this.activeChecks.size,
          uptime: Date.now() - this.registration.registeredAt,
          region: this.config.location.region || "unknown",
          version: this.config.version || "6.1.0",
          checksCompleted: 0,
          totalPoints: 0,
          currentPeriodPoints: 0,
          earnings: {
            points: 0,
            estimatedUSD: 0,
            estimatedCrypto: 0
          }
        };
        await this.channel.publish(EXCHANGES.HEARTBEATS, "worker", Buffer.from(JSON.stringify(heartbeatData)));
        logger.debug("\uD83D\uDC93 Heartbeat sent");
      } catch (error) {
        logger.error("Failed to send heartbeat", error);
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  async stop() {
    logger.info("Stopping worker...");
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.channel) {
      await this.channel.publish(EXCHANGES.REGISTRATION, "unregister", Buffer.from(JSON.stringify({ workerId: this.config.workerId })));
    }
    if (this.channel)
      await this.channel.close();
    if (this.connection)
      await this.connection.close();
    logger.info("Worker stopped");
  }
}

// src/location-detector.ts
import os from "os";

// src/country-mappings.ts
var COUNTRY_TO_CONTINENT = {
  albania: "europe",
  al: "europe",
  andorra: "europe",
  ad: "europe",
  armenia: "europe",
  am: "europe",
  austria: "europe",
  at: "europe",
  azerbaijan: "europe",
  az: "europe",
  belarus: "europe",
  by: "europe",
  belgium: "europe",
  be: "europe",
  "bosnia and herzegovina": "europe",
  ba: "europe",
  bulgaria: "europe",
  bg: "europe",
  croatia: "europe",
  hr: "europe",
  cyprus: "europe",
  cy: "europe",
  "czech republic": "europe",
  czechia: "europe",
  cz: "europe",
  denmark: "europe",
  dk: "europe",
  estonia: "europe",
  ee: "europe",
  finland: "europe",
  fi: "europe",
  france: "europe",
  fr: "europe",
  georgia: "europe",
  ge: "europe",
  germany: "europe",
  de: "europe",
  greece: "europe",
  gr: "europe",
  hungary: "europe",
  hu: "europe",
  iceland: "europe",
  is: "europe",
  ireland: "europe",
  ie: "europe",
  italy: "europe",
  it: "europe",
  kosovo: "europe",
  xk: "europe",
  latvia: "europe",
  lv: "europe",
  liechtenstein: "europe",
  li: "europe",
  lithuania: "europe",
  lt: "europe",
  luxembourg: "europe",
  lu: "europe",
  macedonia: "europe",
  mk: "europe",
  malta: "europe",
  mt: "europe",
  moldova: "europe",
  md: "europe",
  monaco: "europe",
  mc: "europe",
  montenegro: "europe",
  me: "europe",
  netherlands: "europe",
  nl: "europe",
  norway: "europe",
  no: "europe",
  poland: "europe",
  pl: "europe",
  portugal: "europe",
  pt: "europe",
  romania: "europe",
  ro: "europe",
  russia: "europe",
  ru: "europe",
  "san marino": "europe",
  sm: "europe",
  serbia: "europe",
  rs: "europe",
  slovakia: "europe",
  sk: "europe",
  slovenia: "europe",
  si: "europe",
  spain: "europe",
  es: "europe",
  sweden: "europe",
  se: "europe",
  switzerland: "europe",
  ch: "europe",
  turkey: "europe",
  tr: "europe",
  ukraine: "europe",
  ua: "europe",
  "united kingdom": "europe",
  uk: "europe",
  gb: "europe",
  "vatican city": "europe",
  va: "europe",
  canada: "northamerica",
  ca: "northamerica",
  "united states": "northamerica",
  usa: "northamerica",
  us: "northamerica",
  mexico: "northamerica",
  mx: "northamerica",
  guatemala: "northamerica",
  gt: "northamerica",
  belize: "northamerica",
  bz: "northamerica",
  "el salvador": "northamerica",
  sv: "northamerica",
  honduras: "northamerica",
  hn: "northamerica",
  nicaragua: "northamerica",
  ni: "northamerica",
  "costa rica": "northamerica",
  cr: "northamerica",
  panama: "northamerica",
  pa: "northamerica",
  bahamas: "northamerica",
  bs: "northamerica",
  cuba: "northamerica",
  cu: "northamerica",
  jamaica: "northamerica",
  jm: "northamerica",
  haiti: "northamerica",
  ht: "northamerica",
  "dominican republic": "northamerica",
  do: "northamerica",
  barbados: "northamerica",
  bb: "northamerica",
  "trinidad and tobago": "northamerica",
  tt: "northamerica",
  argentina: "southamerica",
  ar: "southamerica",
  bolivia: "southamerica",
  bo: "southamerica",
  brazil: "southamerica",
  br: "southamerica",
  chile: "southamerica",
  cl: "southamerica",
  colombia: "southamerica",
  co: "southamerica",
  ecuador: "southamerica",
  ec: "southamerica",
  guyana: "southamerica",
  gy: "southamerica",
  paraguay: "southamerica",
  py: "southamerica",
  peru: "southamerica",
  pe: "southamerica",
  suriname: "southamerica",
  sr: "southamerica",
  uruguay: "southamerica",
  uy: "southamerica",
  venezuela: "southamerica",
  ve: "southamerica",
  afghanistan: "asia",
  af: "asia",
  bahrain: "asia",
  bh: "asia",
  bangladesh: "asia",
  bd: "asia",
  bhutan: "asia",
  bt: "asia",
  brunei: "asia",
  bn: "asia",
  cambodia: "asia",
  kh: "asia",
  china: "asia",
  cn: "asia",
  india: "asia",
  in: "asia",
  indonesia: "asia",
  id: "asia",
  iran: "asia",
  ir: "asia",
  iraq: "asia",
  iq: "asia",
  israel: "asia",
  il: "asia",
  japan: "asia",
  jp: "asia",
  jordan: "asia",
  jo: "asia",
  kazakhstan: "asia",
  kz: "asia",
  kuwait: "asia",
  kw: "asia",
  kyrgyzstan: "asia",
  kg: "asia",
  laos: "asia",
  la: "asia",
  lebanon: "asia",
  lb: "asia",
  malaysia: "asia",
  my: "asia",
  maldives: "asia",
  mv: "asia",
  mongolia: "asia",
  mn: "asia",
  myanmar: "asia",
  mm: "asia",
  nepal: "asia",
  np: "asia",
  "north korea": "asia",
  kp: "asia",
  oman: "asia",
  om: "asia",
  pakistan: "asia",
  pk: "asia",
  philippines: "asia",
  ph: "asia",
  qatar: "asia",
  qa: "asia",
  "saudi arabia": "asia",
  sa: "asia",
  singapore: "asia",
  sg: "asia",
  "south korea": "asia",
  korea: "asia",
  kr: "asia",
  "sri lanka": "asia",
  lk: "asia",
  syria: "asia",
  sy: "asia",
  taiwan: "asia",
  tw: "asia",
  tajikistan: "asia",
  tj: "asia",
  thailand: "asia",
  th: "asia",
  "timor-leste": "asia",
  tl: "asia",
  turkmenistan: "asia",
  tm: "asia",
  "united arab emirates": "asia",
  uae: "asia",
  ae: "asia",
  uzbekistan: "asia",
  uz: "asia",
  vietnam: "asia",
  vn: "asia",
  yemen: "asia",
  ye: "asia",
  algeria: "africa",
  dz: "africa",
  angola: "africa",
  ao: "africa",
  benin: "africa",
  bj: "africa",
  botswana: "africa",
  bw: "africa",
  "burkina faso": "africa",
  bf: "africa",
  burundi: "africa",
  bi: "africa",
  cameroon: "africa",
  cm: "africa",
  "cape verde": "africa",
  cv: "africa",
  "central african republic": "africa",
  cf: "africa",
  chad: "africa",
  td: "africa",
  comoros: "africa",
  km: "africa",
  congo: "africa",
  cg: "africa",
  "democratic republic of the congo": "africa",
  cd: "africa",
  djibouti: "africa",
  dj: "africa",
  egypt: "africa",
  eg: "africa",
  "equatorial guinea": "africa",
  gq: "africa",
  eritrea: "africa",
  er: "africa",
  ethiopia: "africa",
  et: "africa",
  gabon: "africa",
  ga: "africa",
  gambia: "africa",
  gm: "africa",
  ghana: "africa",
  gh: "africa",
  guinea: "africa",
  gn: "africa",
  "guinea-bissau": "africa",
  gw: "africa",
  "ivory coast": "africa",
  ci: "africa",
  kenya: "africa",
  ke: "africa",
  lesotho: "africa",
  ls: "africa",
  liberia: "africa",
  lr: "africa",
  libya: "africa",
  ly: "africa",
  madagascar: "africa",
  mg: "africa",
  malawi: "africa",
  mw: "africa",
  mali: "africa",
  ml: "africa",
  mauritania: "africa",
  mr: "africa",
  mauritius: "africa",
  mu: "africa",
  morocco: "africa",
  ma: "africa",
  mozambique: "africa",
  mz: "africa",
  namibia: "africa",
  na: "africa",
  niger: "africa",
  ne: "africa",
  nigeria: "africa",
  ng: "africa",
  rwanda: "africa",
  rw: "africa",
  senegal: "africa",
  sn: "africa",
  seychelles: "africa",
  sc: "africa",
  "sierra leone": "africa",
  sl: "africa",
  somalia: "africa",
  so: "africa",
  "south africa": "africa",
  za: "africa",
  "south sudan": "africa",
  ss: "africa",
  sudan: "africa",
  sd: "africa",
  swaziland: "africa",
  sz: "africa",
  tanzania: "africa",
  tz: "africa",
  togo: "africa",
  tg: "africa",
  tunisia: "africa",
  tn: "africa",
  uganda: "africa",
  ug: "africa",
  zambia: "africa",
  zm: "africa",
  zimbabwe: "africa",
  zw: "africa",
  australia: "oceania",
  au: "oceania",
  fiji: "oceania",
  fj: "oceania",
  kiribati: "oceania",
  ki: "oceania",
  "marshall islands": "oceania",
  mh: "oceania",
  micronesia: "oceania",
  fm: "oceania",
  nauru: "oceania",
  nr: "oceania",
  "new zealand": "oceania",
  nz: "oceania",
  palau: "oceania",
  pw: "oceania",
  "papua new guinea": "oceania",
  pg: "oceania",
  samoa: "oceania",
  ws: "oceania",
  "solomon islands": "oceania",
  sb: "oceania",
  tonga: "oceania",
  to: "oceania",
  tuvalu: "oceania",
  tv: "oceania",
  vanuatu: "oceania",
  vu: "oceania"
};
var CONTINENT_CODES = {
  EU: "europe",
  EUR: "europe",
  EUROPE: "europe",
  NA: "northamerica",
  "NORTH AMERICA": "northamerica",
  NORTHAMERICA: "northamerica",
  SA: "southamerica",
  "SOUTH AMERICA": "southamerica",
  SOUTHAMERICA: "southamerica",
  AS: "asia",
  ASIA: "asia",
  AF: "africa",
  AFRICA: "africa",
  OC: "oceania",
  OCEANIA: "oceania",
  AU: "oceania",
  AUSTRALIA: "oceania"
};
var CONTINENT_REGIONS = {
  europe: {
    finland: "north",
    sweden: "north",
    norway: "north",
    denmark: "north",
    iceland: "north",
    estonia: "north",
    latvia: "north",
    lithuania: "north",
    poland: "central",
    germany: "central",
    netherlands: "west",
    belgium: "west",
    luxembourg: "west",
    france: "west",
    uk: "west",
    unitedkingdom: "west",
    ireland: "west",
    spain: "south",
    portugal: "south",
    italy: "south",
    greece: "south",
    malta: "south",
    cyprus: "south",
    switzerland: "central",
    austria: "central",
    czechrepublic: "central",
    czechia: "central",
    slovakia: "central",
    hungary: "central",
    slovenia: "central",
    croatia: "central",
    romania: "east",
    bulgaria: "east",
    ukraine: "east",
    belarus: "east",
    moldova: "east",
    russia: "east"
  },
  northamerica: {
    canada: "north",
    usa: "central",
    unitedstates: "central",
    us: "central",
    mexico: "south",
    guatemala: "central",
    belize: "central",
    elsalvador: "central",
    honduras: "central",
    nicaragua: "central",
    costarica: "central",
    panama: "central",
    cuba: "caribbean",
    jamaica: "caribbean",
    haiti: "caribbean",
    dominicanrepublic: "caribbean",
    bahamas: "caribbean",
    barbados: "caribbean",
    trinidadandtobago: "caribbean"
  },
  southamerica: {
    venezuela: "north",
    colombia: "north",
    guyana: "north",
    suriname: "north",
    brazil: "east",
    peru: "west",
    ecuador: "west",
    chile: "west",
    bolivia: "central",
    paraguay: "central",
    argentina: "south",
    uruguay: "south"
  },
  asia: {
    russia: "north",
    mongolia: "north",
    china: "east",
    japan: "east",
    southkorea: "east",
    korea: "east",
    northkorea: "east",
    taiwan: "east",
    india: "south",
    pakistan: "south",
    bangladesh: "south",
    srilanka: "south",
    nepal: "south",
    bhutan: "south",
    afghanistan: "south",
    iran: "west",
    iraq: "west",
    syria: "west",
    jordan: "west",
    lebanon: "west",
    israel: "west",
    saudiarabia: "west",
    yemen: "west",
    oman: "west",
    unitedarabemirates: "west",
    uae: "west",
    qatar: "west",
    bahrain: "west",
    kuwait: "west",
    turkey: "west",
    thailand: "southeast",
    vietnam: "southeast",
    cambodia: "southeast",
    laos: "southeast",
    myanmar: "southeast",
    malaysia: "southeast",
    singapore: "southeast",
    indonesia: "southeast",
    philippines: "southeast",
    brunei: "southeast",
    timorleste: "southeast",
    kazakhstan: "central",
    uzbekistan: "central",
    turkmenistan: "central",
    tajikistan: "central",
    kyrgyzstan: "central"
  },
  africa: {
    egypt: "north",
    libya: "north",
    tunisia: "north",
    algeria: "north",
    morocco: "north",
    mauritania: "west",
    mali: "west",
    niger: "west",
    nigeria: "west",
    senegal: "west",
    gambia: "west",
    guineabissau: "west",
    guinea: "west",
    sierraleone: "west",
    liberia: "west",
    ivorycoast: "west",
    burkinafaso: "west",
    ghana: "west",
    togo: "west",
    benin: "west",
    capeverde: "west",
    chad: "central",
    centralafricanrepublic: "central",
    cameroon: "central",
    equatorialguinea: "central",
    gabon: "central",
    congo: "central",
    democraticrepublicofthecongo: "central",
    sudan: "east",
    southsudan: "east",
    ethiopia: "east",
    eritrea: "east",
    djibouti: "east",
    somalia: "east",
    kenya: "east",
    uganda: "east",
    rwanda: "east",
    burundi: "east",
    tanzania: "east",
    malawi: "east",
    zambia: "south",
    zimbabwe: "south",
    mozambique: "south",
    botswana: "south",
    namibia: "south",
    southafrica: "south",
    lesotho: "south",
    swaziland: "south",
    madagascar: "south",
    mauritius: "south",
    seychelles: "south",
    comoros: "south"
  },
  oceania: {
    australia: "pacific",
    newzealand: "pacific",
    papuanewguinea: "melanesia",
    solomonislands: "melanesia",
    vanuatu: "melanesia",
    fiji: "melanesia",
    samoa: "polynesia",
    tonga: "polynesia",
    tuvalu: "polynesia",
    kiribati: "micronesia",
    marshallislands: "micronesia",
    micronesia: "micronesia",
    nauru: "micronesia",
    palau: "micronesia"
  }
};

// src/location-detector.ts
var logger2 = createLogger("location-detector");

class LocationDetector {
  static GEO_IP_SERVICES = [
    "http://ip-api.com/json/",
    "https://ipapi.co/json/",
    "https://geolocation-db.com/json/"
  ];
  static getStableWorkerId() {
    if (process.env.WORKER_ID) {
      return process.env.WORKER_ID;
    }
    const hostname = os.hostname();
    const hash = hostname.split("").reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0);
    }, 0);
    return `worker-${hostname}-${Math.abs(hash).toString(36)}`;
  }
  static CLOUD_METADATA_ENDPOINTS = {
    aws: {
      url: "http://169.254.169.254/latest/meta-data/placement/availability-zone",
      timeout: 500,
      parser: (data) => LocationDetector.parseAwsZone(data)
    },
    gcp: {
      url: "http://metadata.google.internal/computeMetadata/v1/instance/zone",
      headers: { "Metadata-Flavor": "Google" },
      timeout: 500,
      parser: (data) => LocationDetector.parseGcpZone(data)
    },
    azure: {
      url: "http://169.254.169.254/metadata/instance/compute/location?api-version=2021-02-01",
      headers: { Metadata: "true" },
      timeout: 500,
      parser: (data) => LocationDetector.parseAzureLocation(data)
    },
    digitalocean: {
      url: "http://169.254.169.254/metadata/v1/region",
      timeout: 500,
      parser: (data) => LocationDetector.parseDigitalOceanRegion(data)
    },
    hetzner: {
      url: "http://169.254.169.254/hetzner/v1/metadata/region",
      timeout: 500,
      parser: (data) => LocationDetector.parseHetznerRegion(data)
    }
  };
  static async detectLocation() {
    logger2.info("\uD83D\uDD0D Starting automatic location detection...");
    const envLocation = LocationDetector.checkEnvironmentVariables();
    if (envLocation) {
      logger2.info("✅ Location from environment variables", envLocation);
      return envLocation;
    }
    const cloudLocation = await LocationDetector.detectCloudProvider();
    if (cloudLocation) {
      logger2.info("✅ Location from cloud provider metadata", cloudLocation);
      return cloudLocation;
    }
    const geoIpLocation = await LocationDetector.detectViaGeoIP();
    if (geoIpLocation) {
      logger2.info("✅ Location from GeoIP", geoIpLocation);
      return geoIpLocation;
    }
    const fallbackLocation = LocationDetector.getFallbackLocation();
    logger2.warn("⚠️ Using fallback location", fallbackLocation);
    return fallbackLocation;
  }
  static checkEnvironmentVariables() {
    if (process.env.WORKER_LOCATION) {
      const parts = process.env.WORKER_LOCATION.split(".");
      if (parts.length >= 5) {
        return {
          continent: parts[0],
          region: parts[1],
          country: parts[2],
          city: parts[3],
          workerId: parts[4]
        };
      }
    }
    if (process.env.WORKER_CONTINENT && process.env.WORKER_COUNTRY) {
      return {
        continent: process.env.WORKER_CONTINENT,
        region: process.env.WORKER_REGION || "unknown",
        country: process.env.WORKER_COUNTRY,
        city: process.env.WORKER_CITY || "unknown",
        workerId: LocationDetector.getStableWorkerId()
      };
    }
    return null;
  }
  static async detectCloudProvider() {
    for (const [provider, config] of Object.entries(LocationDetector.CLOUD_METADATA_ENDPOINTS)) {
      try {
        const response = await axios_default.get(config.url, {
          timeout: config.timeout,
          headers: config.headers || {},
          validateStatus: () => true
        });
        if (response.status === 200 && response.data) {
          const location = config.parser(response.data);
          if (location) {
            logger2.info(`Detected ${provider} environment`);
            return {
              ...location,
              workerId: LocationDetector.getStableWorkerId()
            };
          }
        }
      } catch (error) {}
    }
    return null;
  }
  static async detectViaGeoIP() {
    let publicIp;
    try {
      const ipResponse = await axios_default.get("https://api.ipify.org?format=text", { timeout: 2000 });
      publicIp = ipResponse.data.trim();
      logger2.info(`Public IP: ${publicIp}`);
    } catch (error) {
      logger2.error("Failed to get public IP", error);
      return null;
    }
    for (const serviceUrl of LocationDetector.GEO_IP_SERVICES) {
      try {
        const response = await axios_default.get(serviceUrl + publicIp, { timeout: 3000 });
        const data = response.data;
        logger2.debug("GeoIP response:", data);
        let countryData = data.country || data.country_name || data.countryCode || "unknown";
        const normalizedCountry = LocationDetector.normalizeString(countryData);
        let continent = COUNTRY_TO_CONTINENT[normalizedCountry] || COUNTRY_TO_CONTINENT[countryData.toLowerCase()];
        if (!continent) {
          const continentData = data.continent || data.continent_name || data.continentCode;
          continent = LocationDetector.mapContinent(continentData);
        }
        if (continent === "unknown" && normalizedCountry !== "unknown") {
          continent = COUNTRY_TO_CONTINENT[normalizedCountry] || "unknown";
        }
        const country = normalizedCountry;
        const city = LocationDetector.normalizeString(data.city || data.city_name || data.regionName || "unknown");
        const region = LocationDetector.determineRegion(continent, country);
        return {
          continent,
          region,
          country,
          city,
          workerId: LocationDetector.getStableWorkerId()
        };
      } catch (error) {
        logger2.debug(`GeoIP service ${serviceUrl} failed`, error);
      }
    }
    return null;
  }
  static parseAwsZone(zone) {
    const regionMap = {
      "us-east-1": { continent: "northamerica", region: "east", country: "usa", city: "virginia" },
      "us-east-2": { continent: "northamerica", region: "east", country: "usa", city: "ohio" },
      "us-west-1": { continent: "northamerica", region: "west", country: "usa", city: "california" },
      "us-west-2": { continent: "northamerica", region: "west", country: "usa", city: "oregon" },
      "eu-west-1": { continent: "europe", region: "west", country: "ireland", city: "dublin" },
      "eu-west-2": { continent: "europe", region: "west", country: "uk", city: "london" },
      "eu-west-3": { continent: "europe", region: "west", country: "france", city: "paris" },
      "eu-central-1": { continent: "europe", region: "central", country: "germany", city: "frankfurt" },
      "eu-north-1": { continent: "europe", region: "north", country: "sweden", city: "stockholm" },
      "ap-southeast-1": { continent: "asia", region: "southeast", country: "singapore", city: "singapore" },
      "ap-southeast-2": { continent: "oceania", region: "australia", country: "australia", city: "sydney" },
      "ap-northeast-1": { continent: "asia", region: "east", country: "japan", city: "tokyo" },
      "ap-south-1": { continent: "asia", region: "south", country: "india", city: "mumbai" }
    };
    const region = zone.substring(0, zone.lastIndexOf("-"));
    return regionMap[region] || {};
  }
  static parseGcpZone(zone) {
    const parts = zone.split("/");
    const zoneName = parts[parts.length - 1];
    const region = zoneName.substring(0, zoneName.lastIndexOf("-"));
    const regionMap = {
      "us-central1": { continent: "northamerica", region: "central", country: "usa", city: "iowa" },
      "us-east1": { continent: "northamerica", region: "east", country: "usa", city: "southcarolina" },
      "us-east4": { continent: "northamerica", region: "east", country: "usa", city: "virginia" },
      "us-west1": { continent: "northamerica", region: "west", country: "usa", city: "oregon" },
      "europe-west1": { continent: "europe", region: "west", country: "belgium", city: "brussels" },
      "europe-west2": { continent: "europe", region: "west", country: "uk", city: "london" },
      "europe-west3": { continent: "europe", region: "west", country: "germany", city: "frankfurt" },
      "europe-west4": { continent: "europe", region: "west", country: "netherlands", city: "amsterdam" },
      "asia-east1": { continent: "asia", region: "east", country: "taiwan", city: "taipei" },
      "asia-northeast1": { continent: "asia", region: "east", country: "japan", city: "tokyo" },
      "asia-southeast1": { continent: "asia", region: "southeast", country: "singapore", city: "singapore" }
    };
    return regionMap[region] || {};
  }
  static parseAzureLocation(location) {
    const locationMap = {
      eastus: { continent: "northamerica", region: "east", country: "usa", city: "virginia" },
      eastus2: { continent: "northamerica", region: "east", country: "usa", city: "virginia" },
      westus: { continent: "northamerica", region: "west", country: "usa", city: "california" },
      westus2: { continent: "northamerica", region: "west", country: "usa", city: "washington" },
      northeurope: { continent: "europe", region: "north", country: "ireland", city: "dublin" },
      westeurope: { continent: "europe", region: "west", country: "netherlands", city: "amsterdam" },
      uksouth: { continent: "europe", region: "west", country: "uk", city: "london" },
      francecentral: { continent: "europe", region: "west", country: "france", city: "paris" },
      germanywestcentral: { continent: "europe", region: "central", country: "germany", city: "frankfurt" },
      japaneast: { continent: "asia", region: "east", country: "japan", city: "tokyo" },
      southeastasia: { continent: "asia", region: "southeast", country: "singapore", city: "singapore" },
      australiaeast: { continent: "oceania", region: "australia", country: "australia", city: "sydney" }
    };
    return locationMap[location.toLowerCase()] || {};
  }
  static parseDigitalOceanRegion(region) {
    const regionMap = {
      nyc1: { continent: "northamerica", region: "east", country: "usa", city: "newyork" },
      nyc3: { continent: "northamerica", region: "east", country: "usa", city: "newyork" },
      sfo1: { continent: "northamerica", region: "west", country: "usa", city: "sanfrancisco" },
      sfo2: { continent: "northamerica", region: "west", country: "usa", city: "sanfrancisco" },
      sfo3: { continent: "northamerica", region: "west", country: "usa", city: "sanfrancisco" },
      tor1: { continent: "northamerica", region: "east", country: "canada", city: "toronto" },
      lon1: { continent: "europe", region: "west", country: "uk", city: "london" },
      fra1: { continent: "europe", region: "central", country: "germany", city: "frankfurt" },
      ams3: { continent: "europe", region: "west", country: "netherlands", city: "amsterdam" },
      sgp1: { continent: "asia", region: "southeast", country: "singapore", city: "singapore" },
      blr1: { continent: "asia", region: "south", country: "india", city: "bangalore" },
      syd1: { continent: "oceania", region: "australia", country: "australia", city: "sydney" }
    };
    return regionMap[region] || {};
  }
  static parseHetznerRegion(region) {
    const regionMap = {
      fsn1: { continent: "europe", region: "central", country: "germany", city: "falkenstein" },
      nbg1: { continent: "europe", region: "central", country: "germany", city: "nuremberg" },
      hel1: { continent: "europe", region: "north", country: "finland", city: "helsinki" },
      ash: { continent: "northamerica", region: "east", country: "usa", city: "ashburn" }
    };
    return regionMap[region] || {};
  }
  static mapContinent(input) {
    if (!input)
      return "unknown";
    const normalized = input.toUpperCase();
    return CONTINENT_CODES[normalized] || "unknown";
  }
  static normalizeString(input) {
    return input.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 20);
  }
  static determineRegion(continent, country) {
    return CONTINENT_REGIONS[continent]?.[country] || "general";
  }
  static getFallbackLocation() {
    return {
      continent: "europe",
      region: "unknown",
      country: "unknown",
      city: "unknown",
      workerId: LocationDetector.getStableWorkerId()
    };
  }
}

// src/auto-geographic-worker.ts
import * as fs from "fs/promises";
import * as path from "path";
import * as os2 from "os";
var logger3 = createLogger("auto-worker");
var API_ENDPOINT = process.env.API_ENDPOINT || "https://guardant.me";
var OWNER_EMAIL = process.env.OWNER_EMAIL || "admin@guardant.me";
var CREDENTIALS_FILE = path.join(os2.homedir(), ".guardant-worker-creds.json");
async function registerWorker(workerId, location) {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/worker/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId,
        ownerEmail: OWNER_EMAIL,
        name: `Geographic Worker ${location.city}`,
        region: `${location.continent}.${location.region}`,
        location,
        capabilities: (process.env.WORKER_CAPABILITIES || "http,https,tcp,ping").split(","),
        version: process.env.WORKER_VERSION || "6.0.7"
      })
    });
    if (!response.ok) {
      logger3.error(`Registration failed: ${response.status} ${response.statusText}`);
      return false;
    }
    const result = await response.json();
    logger3.info("✅ Worker registered successfully", { workerId: result.workerId });
    return true;
  } catch (error) {
    logger3.error("Failed to register worker:", error);
    return false;
  }
}
async function checkWorkerStatus(workerId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/api/worker/status/${workerId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      return null;
    }
    const status = await response.json();
    return status;
  } catch (error) {
    logger3.error("Failed to check worker status:", error);
    return null;
  }
}
async function saveCredentials(workerId, rabbitmqUrl) {
  try {
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify({ workerId, rabbitmqUrl }, null, 2));
    logger3.info("\uD83D\uDCBE Credentials saved locally");
  } catch (error) {
    logger3.warn("Could not save credentials locally:", error);
  }
}
async function loadCredentials() {
  try {
    const data = await fs.readFile(CREDENTIALS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}
async function waitForApproval(workerId) {
  logger3.info("⏳ Waiting for admin approval...");
  logger3.info("\uD83D\uDCCB Please approve this worker in the admin panel at:");
  logger3.info(`   ${API_ENDPOINT}/admin/workers`);
  while (true) {
    const status = await checkWorkerStatus(workerId);
    if (status && status.approved && status.rabbitmqUrl) {
      logger3.info("✅ Worker approved by admin!");
      return status;
    }
    logger3.debug("Still waiting for approval...");
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
}
async function startAutoWorker() {
  logger3.info("\uD83D\uDE80 Starting GuardAnt Geographic Worker with auto-location detection...");
  try {
    const location = await LocationDetector.detectLocation();
    logger3.info("\uD83D\uDCCD Detected location:", {
      continent: location.continent,
      region: location.region,
      country: location.country,
      city: location.city,
      workerId: location.workerId
    });
    const locationString = `${location.continent}.${location.region}.${location.country}.${location.city}`;
    console.log(`
╔═══════════════════════════════════════════════════════╗`);
    console.log(`║ \uD83C\uDF0D Worker Location: ${locationString.padEnd(33)} ║`);
    console.log(`║ \uD83C\uDD94 Worker ID: ${location.workerId.padEnd(39)} ║`);
    console.log(`╚═══════════════════════════════════════════════════════╝
`);
    let rabbitmqUrl = process.env.RABBITMQ_URL;
    const savedCreds = await loadCredentials();
    if (savedCreds && savedCreds.workerId === location.workerId) {
      logger3.info("\uD83D\uDCC2 Found saved credentials, checking if still valid...");
      const status = await checkWorkerStatus(location.workerId);
      if (status && status.approved) {
        logger3.info("✅ Using existing approved credentials");
        rabbitmqUrl = savedCreds.rabbitmqUrl;
      }
    }
    if (!rabbitmqUrl || rabbitmqUrl === "amqp://rabbitmq:5672") {
      logger3.info("\uD83D\uDCDD Registering worker...");
      const registered = await registerWorker(location.workerId, location);
      if (!registered) {
        throw new Error("Failed to register worker");
      }
      const approval = await waitForApproval(location.workerId);
      rabbitmqUrl = approval.rabbitmqUrl;
      await saveCredentials(location.workerId, rabbitmqUrl);
      if (approval.geographic) {
        if (approval.geographic.continent)
          location.continent = approval.geographic.continent;
        if (approval.geographic.region)
          location.region = approval.geographic.region;
        if (approval.geographic.country)
          location.country = approval.geographic.country;
        if (approval.geographic.city)
          location.city = approval.geographic.city;
        logger3.info("\uD83D\uDCCD Location updated by admin:", location);
      }
    }
    const config = {
      workerId: location.workerId,
      location,
      rabbitmqUrl,
      capabilities: (process.env.WORKER_CAPABILITIES || "http,https,tcp,ping").split(","),
      version: process.env.WORKER_VERSION || "6.1.3"
    };
    logger3.info("\uD83D\uDD27 Worker configuration:", {
      workerId: config.workerId,
      location: `${location.continent}.${location.region}.${location.country}.${location.city}`,
      rabbitmqUrl: config.rabbitmqUrl.replace(/:[^:@]+@/, ":****@"),
      capabilities: config.capabilities,
      version: config.version
    });
    const worker = new GeographicWorker(config);
    await worker.start();
    logger3.info("✅ Worker started successfully");
    process.on("SIGINT", async () => {
      logger3.info("\uD83D\uDED1 Shutting down gracefully...");
      await worker.stop();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      logger3.info("\uD83D\uDED1 Shutting down gracefully...");
      await worker.stop();
      process.exit(0);
    });
  } catch (error) {
    logger3.error("❌ Failed to start worker:", error);
    process.exit(1);
  }
}
startAutoWorker().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
