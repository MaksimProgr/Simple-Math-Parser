var calc = function (expression) {
  var constants = {
    'pi': Math.PI,
    'e': Math.E,
    'cos': Math.cos,
    'sin': Math.sin,
    'tg': Math.tan,
    'ctg': function(a) { return 1.0/Math.tan(a); },
    'ln': Math.log,
    'log': function(a,b) { return Math.log(a)/Math.log(b); },
    'sqrt': Math.sqrt,
    'min': Math.min,
    'max': Math.max
  };
  var operators = [
    [ // priority 0
    [ null, /^,/, null, function(a,b,c) { if (typeof a == 'number') {
        return [a,c];
    } else {
        var tmp = a.slice(0);
        tmp.push(c);
        return tmp;
    }}]
    ], 
    [ // priority 1
    [ null, /^\+/, null, function(a,b,c) { return a+c; } ],
    [ null, /^\-/, null, function(a,b,c) { return a-c; } ]
    ], 
    [ // priority 2
    [ null, /^\//, null, function(a,b,c) { return a/c; } ],
    [ null, /^\*/, null, function(a,b,c) { return a*c; } ]
    ],
    [ // priority 4
    [ null, /^\^/, null, function(a,b,c) { return Math.pow(a,c); } ]
    ],
    [ // priotity 4
    [ /^\-/, null, function(a,b) { return -b; } ]
    ],
    [ // priority 5
    [ /^\(/, null, /^\)/, function(a,b,c) { return b; } ],
    [ null, /^\s*\(/, null, /^\)/, function(a,b,c,d) { 
      if (typeof c == 'number') return a(c); else return a.apply(null, c); } 
    ],
    [ /^\|/, null, /^\|/, function(a,b,c) { return Math.abs(b); } ],
    [ /^\[/, null, /^\]/, function(a,b,c) { return Math.floor(b); } ]
    ],
    [ // priority 6
    [ /^\-?\d+(\.\d+)?(e\-?\d+)?/, function(a) { return (!isNaN(parseFloat(a)) && isFinite(a)) ? parseFloat(a) : null; } ],
    [ /[a-zA-Z][a-zA-Z0-9_]*/, function(a) {
      if (!constants[a]) {
        throw 'reference error: '+a+' is not found';
      }
      return constants[a]; 
    } ]
    ]
  ];
  
  var totalDepth = -1;
  
  var res = function parse(depth) {
    totalDepth++;
    expression = expression.trim();
  
    var stack = [];
    var currOperators = operators[depth];
    
    function processOperator(op) {
      var match;
      if (op && stack.length<op.length-1 && op[stack.length] &&
      (match = expression.match(op[stack.length]))!==null) {
        stack.push(match[0]);
        expression = expression.slice(match[0].length).trim();
        return true;
      }
      return false;
    }
    
    while (true) {
    var op = null;
    while (!op) { 
      for (var i = 0; i<currOperators.length; i++) {
        var curr = currOperators[i];
        if (processOperator(curr)) {
          op = curr;
          break;
        }
      }
      if (!op) {
        var deep = null;
        if (depth<operators.length-1 && stack.length==0) {
          deep = parse(depth+1);
        }
        if (deep!==null) {
          stack.push(deep);
        } else {
          if (totalDepth==0 && expression.length>0) {
            throw 'invalid token: '+expression[0];
          }
          totalDepth--;
          return stack.length ? stack[0]: null;
        }
      }
    }
    
    while (stack.length<op.length-1) {
      if (!processOperator(op)) {
        if (op[stack.length]) {
          throw 'syntax error: unmatched '+stack[0];
        }
        var trydepth = 0;
        if (stack.length==op.length-2) {
          trydepth = depth+1;
        }
        var deep = parse(trydepth);
        if (deep===null) {
          throw 'syntax error: '+(expression[0] || stack[0]);
        }
        stack.push(deep);
      }
    }
    
    var res = op[op.length-1].apply(null,stack);
    if (res===null || op[op.length-2]) {
      totalDepth--;
      return res;
    }
    stack = [res];
    }
  } (0);
  return parseFloat(res);
};
