if (! _$jscoverage['javascript-getter-setter.js']) {
  _$jscoverage['javascript-getter-setter.js'] = [];
  _$jscoverage['javascript-getter-setter.js'][1] = 0;
  _$jscoverage['javascript-getter-setter.js'][4] = 0;
  _$jscoverage['javascript-getter-setter.js'][7] = 0;
  _$jscoverage['javascript-getter-setter.js'][11] = 0;
  _$jscoverage['javascript-getter-setter.js'][14] = 0;
  _$jscoverage['javascript-getter-setter.js'][17] = 0;
}
_$jscoverage['javascript-getter-setter.js'].source = ["<span class=\"k\">var</span> o <span class=\"k\">=</span> <span class=\"k\">{</span>","  _x<span class=\"k\">:</span> <span class=\"s\">123</span><span class=\"k\">,</span>","  get x<span class=\"k\">()</span> <span class=\"k\">{</span>","    <span class=\"k\">return</span> <span class=\"k\">this</span><span class=\"k\">.</span>_x<span class=\"k\">;</span>","  <span class=\"k\">}</span><span class=\"k\">,</span>","  set x<span class=\"k\">(</span>value<span class=\"k\">)</span> <span class=\"k\">{</span>","    <span class=\"k\">this</span><span class=\"k\">.</span>_x <span class=\"k\">=</span> value<span class=\"k\">;</span>","  <span class=\"k\">}</span>","<span class=\"k\">}</span><span class=\"k\">;</span>","","o <span class=\"k\">=</span> <span class=\"k\">{</span>","  _x<span class=\"k\">:</span> <span class=\"s\">123</span><span class=\"k\">,</span>","  get x get_x<span class=\"k\">()</span> <span class=\"k\">{</span>","    <span class=\"k\">return</span> <span class=\"k\">this</span><span class=\"k\">.</span>_x<span class=\"k\">;</span>","  <span class=\"k\">}</span><span class=\"k\">,</span>","  set x set_x<span class=\"k\">(</span>value<span class=\"k\">)</span> <span class=\"k\">{</span>","    <span class=\"k\">this</span><span class=\"k\">.</span>_x <span class=\"k\">=</span> value<span class=\"k\">;</span>","  <span class=\"k\">}</span>","<span class=\"k\">}</span><span class=\"k\">;</span>"];
_$jscoverage['javascript-getter-setter.js'][1]++;
var o = {_x: 123, get x () {
  _$jscoverage['javascript-getter-setter.js'][4]++;
  return this._x;
}, set x (value) {
  _$jscoverage['javascript-getter-setter.js'][7]++;
  this._x = value;
}};
_$jscoverage['javascript-getter-setter.js'][11]++;
o = {_x: 123, get x get_x() {
  _$jscoverage['javascript-getter-setter.js'][14]++;
  return this._x;
}, set x set_x(value) {
  _$jscoverage['javascript-getter-setter.js'][17]++;
  this._x = value;
}};
