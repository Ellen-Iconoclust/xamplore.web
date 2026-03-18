export const LOGIC_PUZZLES = [
  {
    code: 'let x = 5;\nlet y = 10;\nif (x < y) {\n  x = x + 2;\n} else {\n  y = y - 2;\n}\nconsole.log(x);',
    options: ['5', '7', '10', '12'],
    answer: '7',
    explanation: 'Since 5 < 10 is true, the if block executes, adding 2 to x.'
  },
  {
    code: 'let count = 0;\nfor (let i = 0; i < 3; i++) {\n  count += i;\n}\nconsole.log(count);',
    options: ['0', '3', '6', '1'],
    answer: '3',
    explanation: 'The loop runs for i = 0, 1, 2. count becomes 0 + 0 + 1 + 2 = 3.'
  },
  {
    code: 'let arr = [1, 2, 3];\nlet res = arr.map(n => n * 2);\nconsole.log(res[1]);',
    options: ['1', '2', '4', '6'],
    answer: '4',
    explanation: 'map(n => n * 2) creates [2, 4, 6]. Index 1 is 4.'
  },
  {
    code: 'let a = true;\nlet b = false;\nconsole.log(a && b || !b);',
    options: ['true', 'false', 'undefined', 'null'],
    answer: 'true',
    explanation: '(true && false) is false. (false || !false) is (false || true), which is true.'
  },
  {
    code: 'function add(a, b = 5) {\n  return a + b;\n}\nconsole.log(add(3));',
    options: ['3', '5', '8', 'NaN'],
    answer: '8',
    explanation: 'b defaults to 5 if not provided. 3 + 5 = 8.'
  },
  {
    code: 'let x = 10;\nlet y = "10";\nconsole.log(x == y);',
    options: ['true', 'false', 'error', 'undefined'],
    answer: 'true',
    explanation: '== performs type coercion, so number 10 equals string "10".'
  },
  {
    code: 'let x = 10;\nlet y = "10";\nconsole.log(x === y);',
    options: ['true', 'false', 'error', 'undefined'],
    answer: 'false',
    explanation: '=== checks both value and type. Number and string are different types.'
  },
  {
    code: 'let i = 0;\nwhile (i < 5) {\n  if (i === 3) break;\n  i++;\n}\nconsole.log(i);',
    options: ['0', '3', '5', '4'],
    answer: '3',
    explanation: 'The loop stops immediately when i reaches 3 due to the break statement.'
  },
  {
    code: 'let x = [1, 2, 3];\nx.push(4);\nx.pop();\nconsole.log(x.length);',
    options: ['2', '3', '4', '5'],
    answer: '3',
    explanation: 'push adds 4 (length 4), pop removes it (length 3).'
  },
  {
    code: 'let obj = { a: 1, b: 2 };\nconsole.log(obj["c"] || 0);',
    options: ['1', '2', '0', 'undefined'],
    answer: '0',
    explanation: 'obj["c"] is undefined, so the OR operator returns the fallback value 0.'
  },
  {
    code: 'let x = 5;\nlet y = x++;\nconsole.log(y);',
    options: ['5', '6', '4', 'undefined'],
    answer: '5',
    explanation: 'x++ is postfix increment; it returns the current value before incrementing.'
  },
  {
    code: 'let x = 5;\nlet y = ++x;\nconsole.log(y);',
    options: ['5', '6', '4', 'undefined'],
    answer: '6',
    explanation: '++x is prefix increment; it increments the value and then returns it.'
  },
  {
    code: 'console.log(typeof []);',
    options: ['array', 'object', 'list', 'undefined'],
    answer: 'object',
    explanation: 'In JavaScript, arrays are a special type of object.'
  },
  {
    code: 'let a = [1, 2];\nlet b = [...a, 3];\nconsole.log(b.length);',
    options: ['1', '2', '3', '4'],
    answer: '3',
    explanation: 'The spread operator (...) copies elements of a into b, then 3 is added.'
  },
  {
    code: 'let x = 10;\nfunction test() {\n  let x = 20;\n}\ntest();\nconsole.log(x);',
    options: ['10', '20', 'undefined', 'error'],
    answer: '10',
    explanation: 'The x inside test() is locally scoped and does not affect the outer x.'
  },
  {
    code: 'let str = "Hello";\nconsole.log(str.substring(0, 2));',
    options: ['He', 'Hel', 'el', 'lo'],
    answer: 'He',
    explanation: 'substring(0, 2) returns characters from index 0 up to (but not including) 2.'
  },
  {
    code: 'let x = null;\nconsole.log(typeof x);',
    options: ['null', 'object', 'undefined', 'string'],
    answer: 'object',
    explanation: 'This is a well-known historical bug in JavaScript: typeof null is "object".'
  },
  {
    code: 'let a = [1, 2, 3];\nlet [x, y] = a;\nconsole.log(y);',
    options: ['1', '2', '3', 'undefined'],
    answer: '2',
    explanation: 'Destructuring assigns the first element to x and the second to y.'
  },
  {
    code: 'let x = 1;\nswitch(x) {\n  case 1: x += 1;\n  case 2: x += 1;\n}\nconsole.log(x);',
    options: ['1', '2', '3', '4'],
    answer: '3',
    explanation: 'Without break statements, execution "falls through" to the next case.'
  },
  {
    code: 'let x = "5" + 5;\nconsole.log(x);',
    options: ['10', '55', 'NaN', 'error'],
    answer: '55',
    explanation: 'When adding a string and a number, the number is coerced to a string.'
  },
  {
    code: 'let x = "5" - 5;\nconsole.log(x);',
    options: ['0', '55', 'NaN', 'error'],
    answer: '0',
    explanation: 'Subtraction coerces the string "5" to the number 5.'
  },
  {
    code: 'let x = [1, 2, 3];\nconsole.log(x.indexOf(2));',
    options: ['0', '1', '2', '-1'],
    answer: '1',
    explanation: 'indexOf returns the index of the first occurrence of the value.'
  },
  {
    code: 'let x = 0 || 1 && 2;\nconsole.log(x);',
    options: ['0', '1', '2', 'true'],
    answer: '2',
    explanation: '&& has higher precedence than ||. 1 && 2 is 2. 0 || 2 is 2.'
  },
  {
    code: 'let x = (true ? 1 : 2);\nconsole.log(x);',
    options: ['1', '2', 'true', 'false'],
    answer: '1',
    explanation: 'The ternary operator returns the first value if the condition is true.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.filter(n => n > 1);\nconsole.log(y.length);',
    options: ['1', '2', '3', '0'],
    answer: '2',
    explanation: 'filter returns elements greater than 1: [2, 3]. length is 2.'
  },
  {
    code: 'let x = 0;\nfor (let i = 0; i < 5; i++) {\n  if (i % 2 === 0) continue;\n  x++;\n}\nconsole.log(x);',
    options: ['2', '3', '5', '0'],
    answer: '2',
    explanation: 'The loop increments x for odd values of i (1 and 3).'
  },
  {
    code: 'let x = { a: 1 };\nlet y = x;\ny.a = 2;\nconsole.log(x.a);',
    options: ['1', '2', 'undefined', 'error'],
    answer: '2',
    explanation: 'Objects are passed by reference. Changing y affects x.'
  },
  {
    code: 'let x = "abc";\nconsole.log(x.split("").reverse().join(""));',
    options: ['abc', 'cba', 'a,b,c', 'undefined'],
    answer: 'cba',
    explanation: 'Split to array, reverse array, join back to string.'
  },
  {
    code: 'let x = 10;\nfunction outer() {\n  let x = 20;\n  function inner() {\n    return x;\n  }\n  return inner();\n}\nconsole.log(outer());',
    options: ['10', '20', 'undefined', 'error'],
    answer: '20',
    explanation: 'Inner function has access to outer function\'s scope (closure).'
  },
  {
    code: 'let x = [1, 2, 3];\nconsole.log(x.includes(4));',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'false',
    explanation: 'includes returns true if the array contains the value, false otherwise.'
  },
  {
    code: 'let x = 5;\nif (x > 0) {\n  let x = 10;\n}\nconsole.log(x);',
    options: ['5', '10', 'undefined', 'error'],
    answer: '5',
    explanation: 'The x inside the if block is block-scoped and doesn\'t affect outer x.'
  },
  {
    code: 'let x = "Hello World";\nconsole.log(x.length);',
    options: ['10', '11', '12', '9'],
    answer: '11',
    explanation: 'Length includes spaces and punctuation.'
  },
  {
    code: 'let x = 10 / 0;\nconsole.log(x);',
    options: ['0', 'Infinity', 'NaN', 'error'],
    answer: 'Infinity',
    explanation: 'In JavaScript, division by zero results in Infinity.'
  },
  {
    code: 'let x = 0 / 0;\nconsole.log(x);',
    options: ['0', 'Infinity', 'NaN', 'error'],
    answer: 'NaN',
    explanation: 'Zero divided by zero is Not-a-Number (NaN).'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.reduce((acc, curr) => acc + curr, 0);\nconsole.log(y);',
    options: ['3', '6', '1', '0'],
    answer: '6',
    explanation: 'reduce sums the elements: 0 + 1 + 2 + 3 = 6.'
  },
  {
    code: 'let x = "123";\nconsole.log(Number(x));',
    options: ['123', '"123"', 'NaN', 'error'],
    answer: '123',
    explanation: 'Number() converts a string to a number if possible.'
  },
  {
    code: 'let x = "abc";\nconsole.log(Number(x));',
    options: ['abc', '0', 'NaN', 'error'],
    answer: 'NaN',
    explanation: 'If a string cannot be converted to a number, Number() returns NaN.'
  },
  {
    code: 'let x = [1, 2, 3];\nx[10] = 11;\nconsole.log(x.length);',
    options: ['3', '4', '10', '11'],
    answer: '11',
    explanation: 'Setting an index beyond current length expands the array.'
  },
  {
    code: 'let x = 5;\nlet y = "5";\nconsole.log(x !== y);',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'true',
    explanation: '!== checks both value and type. They are different types.'
  },
  {
    code: 'let x = true + true;\nconsole.log(x);',
    options: ['true', '2', '1', 'NaN'],
    answer: '2',
    explanation: 'In math operations, true is coerced to 1. 1 + 1 = 2.'
  },
  {
    code: 'let x = false + true;\nconsole.log(x);',
    options: ['true', 'false', '1', '0'],
    answer: '1',
    explanation: 'false is 0, true is 1. 0 + 1 = 1.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.slice(0, 1);\nconsole.log(y.length);',
    options: ['0', '1', '2', '3'],
    answer: '1',
    explanation: 'slice(0, 1) returns elements from index 0 up to (not including) 1.'
  },
  {
    code: 'let x = "hello";\nconsole.log(x.toUpperCase());',
    options: ['hello', 'HELLO', 'Hello', 'undefined'],
    answer: 'HELLO',
    explanation: 'toUpperCase() returns the string in all capital letters.'
  },
  {
    code: 'let x = 10;\nlet y = 3;\nconsole.log(x % y);',
    options: ['1', '3', '0', '10'],
    answer: '1',
    explanation: '% is the remainder operator. 10 divided by 3 has a remainder of 1.'
  },
  {
    code: 'let x = 2 ** 3;\nconsole.log(x);',
    options: ['6', '8', '9', '5'],
    answer: '8',
    explanation: '** is the exponentiation operator. 2 to the power of 3 is 8.'
  },
  {
    code: 'let x = Math.floor(4.7);\nconsole.log(x);',
    options: ['4', '5', '4.7', '0'],
    answer: '4',
    explanation: 'Math.floor() rounds down to the nearest integer.'
  },
  {
    code: 'let x = Math.ceil(4.1);\nconsole.log(x);',
    options: ['4', '5', '4.1', '0'],
    answer: '5',
    explanation: 'Math.ceil() rounds up to the nearest integer.'
  },
  {
    code: 'let x = Math.round(4.5);\nconsole.log(x);',
    options: ['4', '5', '4.5', '0'],
    answer: '5',
    explanation: 'Math.round() rounds to the nearest integer (.5 rounds up).'
  },
  {
    code: 'let x = "5";\nconsole.log(+x + 5);',
    options: ['55', '10', 'NaN', 'error'],
    answer: '10',
    explanation: 'The unary plus (+) operator coerces the string "5" to number 5.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.join("-");\nconsole.log(y);',
    options: ['123', '1-2-3', '[1,2,3]', 'undefined'],
    answer: '1-2-3',
    explanation: 'join("-") combines array elements into a string with "-" separator.'
  },
  {
    code: 'let x = 10;\nif (x > 5) {\n  x = 20;\n} else if (x > 15) {\n  x = 30;\n}\nconsole.log(x);',
    options: ['10', '20', '30', '5'],
    answer: '20',
    explanation: 'The first true condition executes; others are skipped.'
  },
  {
    code: 'let x = 1;\nwhile (x < 10) {\n  x *= 2;\n}\nconsole.log(x);',
    options: ['8', '10', '16', '9'],
    answer: '16',
    explanation: 'x goes 1 -> 2 -> 4 -> 8 -> 16. 16 is not < 10, so loop stops.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.find(n => n > 1);\nconsole.log(y);',
    options: ['1', '2', '3', 'undefined'],
    answer: '2',
    explanation: 'find() returns the first element that satisfies the condition.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.every(n => n > 0);\nconsole.log(y);',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'true',
    explanation: 'every() returns true if all elements satisfy the condition.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.some(n => n > 2);\nconsole.log(y);',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'true',
    explanation: 'some() returns true if at least one element satisfies the condition.'
  },
  {
    code: 'let x = "hello";\nconsole.log(x[0]);',
    options: ['h', 'e', 'l', 'o'],
    answer: 'h',
    explanation: 'Strings can be indexed like arrays.'
  },
  {
    code: 'let x = "hello";\nx[0] = "H";\nconsole.log(x);',
    options: ['hello', 'Hello', 'H', 'error'],
    answer: 'hello',
    explanation: 'Strings are immutable in JavaScript; indexing cannot change them.'
  },
  {
    code: 'let x = { a: 1 };\ndelete x.a;\nconsole.log(x.a);',
    options: ['1', 'null', 'undefined', 'error'],
    answer: 'undefined',
    explanation: 'The delete operator removes a property from an object.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.concat([4, 5]);\nconsole.log(y.length);',
    options: ['3', '4', '5', '2'],
    answer: '5',
    explanation: 'concat() merges two or more arrays into a new array.'
  },
  {
    code: 'let x = 10;\nfunction test(n) {\n  n = 20;\n}\ntest(x);\nconsole.log(x);',
    options: ['10', '20', 'undefined', 'error'],
    answer: '10',
    explanation: 'Primitive values are passed by value, not reference.'
  },
  {
    code: 'let x = "10.5";\nconsole.log(parseInt(x));',
    options: ['10', '10.5', '11', 'NaN'],
    answer: '10',
    explanation: 'parseInt() parses a string and returns an integer.'
  },
  {
    code: 'let x = "10.5";\nconsole.log(parseFloat(x));',
    options: ['10', '10.5', '11', 'NaN'],
    answer: '10.5',
    explanation: 'parseFloat() parses a string and returns a floating-point number.'
  },
  {
    code: 'let x = !!1;\nconsole.log(x);',
    options: ['1', 'true', 'false', 'undefined'],
    answer: 'true',
    explanation: '!! converts a value to its boolean equivalent. 1 is truthy.'
  },
  {
    code: 'let x = !!0;\nconsole.log(x);',
    options: ['0', 'true', 'false', 'undefined'],
    answer: 'false',
    explanation: '0 is falsy, so !!0 is false.'
  },
  {
    code: 'let x = " ";\nconsole.log(!!x);',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'true',
    explanation: 'A non-empty string (even just a space) is truthy.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.shift();\nconsole.log(y);',
    options: ['1', '2', '3', 'undefined'],
    answer: '1',
    explanation: 'shift() removes and returns the first element of an array.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.unshift(0);\nconsole.log(y);',
    options: ['0', '1', '3', '4'],
    answer: '4',
    explanation: 'unshift() adds element to start and returns the new length.'
  },
  {
    code: 'let x = 5;\nlet y = 2;\nconsole.log(Math.pow(x, y));',
    options: ['7', '10', '25', '32'],
    answer: '25',
    explanation: 'Math.pow(5, 2) is 5 squared, which is 25.'
  },
  {
    code: 'let x = "hello";\nconsole.log(x.charAt(1));',
    options: ['h', 'e', 'l', 'o'],
    answer: 'e',
    explanation: 'charAt(1) returns the character at index 1.'
  },
  {
    code: 'let x = "hello";\nconsole.log(x.indexOf("l"));',
    options: ['1', '2', '3', '4'],
    answer: '2',
    explanation: 'indexOf returns the index of the first occurrence.'
  },
  {
    code: 'let x = "hello";\nconsole.log(x.lastIndexOf("l"));',
    options: ['1', '2', '3', '4'],
    answer: '3',
    explanation: 'lastIndexOf returns the index of the last occurrence.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.reverse();\nconsole.log(y[0]);',
    options: ['1', '2', '3', 'undefined'],
    answer: '3',
    explanation: 'reverse() reverses the array in place.'
  },
  {
    code: 'let x = [3, 1, 2];\nx.sort();\nconsole.log(x[0]);',
    options: ['3', '1', '2', 'undefined'],
    answer: '1',
    explanation: 'sort() sorts the array (default is ascending).'
  },
  {
    code: 'let x = [10, 2, 3];\nx.sort();\nconsole.log(x[0]);',
    options: ['2', '3', '10', 'undefined'],
    answer: '10',
    explanation: 'Default sort() converts elements to strings. "10" comes before "2".'
  },
  {
    code: 'let x = 10;\nlet y = x.toString();\nconsole.log(typeof y);',
    options: ['number', 'string', 'object', 'undefined'],
    answer: 'string',
    explanation: 'toString() converts a value to a string.'
  },
  {
    code: 'let x = 123.456;\nconsole.log(x.toFixed(2));',
    options: ['123', '123.4', '123.45', '123.46'],
    answer: '123.46',
    explanation: 'toFixed(2) rounds to 2 decimal places and returns a string.'
  },
  {
    code: 'let x = "Hello";\nconsole.log(x.repeat(2));',
    options: ['Hello', 'HelloHello', 'Hello 2', 'error'],
    answer: 'HelloHello',
    explanation: 'repeat(n) returns a new string with n copies of the original.'
  },
  {
    code: 'let x = "  hello  ";\nconsole.log(x.trim().length);',
    options: ['9', '7', '5', '11'],
    answer: '5',
    explanation: 'trim() removes whitespace from both ends of a string.'
  },
  {
    code: 'let x = "apple,banana,cherry";\nlet y = x.split(",");\nconsole.log(y.length);',
    options: ['1', '2', '3', '19'],
    answer: '3',
    explanation: 'split(",") creates an array of 3 elements.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.splice(1, 1);\nconsole.log(x.length);',
    options: ['1', '2', '3', '0'],
    answer: '2',
    explanation: 'splice(1, 1) removes 1 element starting at index 1.'
  },
  {
    code: 'let x = [1, 2, 3];\nx.splice(1, 0, 4);\nconsole.log(x[1]);',
    options: ['1', '2', '3', '4'],
    answer: '4',
    explanation: 'splice(1, 0, 4) inserts 4 at index 1 without removing anything.'
  },
  {
    code: 'let x = 10;\nfunction test() {\n  console.log(x);\n  let x = 20;\n}\ntest();',
    options: ['10', '20', 'undefined', 'error'],
    answer: 'error',
    explanation: 'Accessing a let variable before declaration in its block causes a ReferenceError (Temporal Dead Zone).'
  },
  {
    code: 'console.log(a);\nvar a = 10;',
    options: ['10', 'undefined', 'error', 'null'],
    answer: 'undefined',
    explanation: 'var declarations are hoisted and initialized with undefined.'
  },
  {
    code: 'let x = () => 5;\nconsole.log(x());',
    options: ['5', 'undefined', 'error', '() => 5'],
    answer: '5',
    explanation: 'Arrow function that returns 5.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = [...x];\nconsole.log(x === y);',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'false',
    explanation: 'Spread operator creates a new array (shallow copy).'
  },
  {
    code: 'let x = { a: 1 };\nlet y = { ...x };\nconsole.log(x === y);',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'false',
    explanation: 'Spread operator creates a new object (shallow copy).'
  },
  {
    code: 'let x = [1, 2];\nlet y = [3, 4];\nlet z = [...x, ...y];\nconsole.log(z.length);',
    options: ['2', '4', '6', '8'],
    answer: '4',
    explanation: 'Combines both arrays into one of length 4.'
  },
  {
    code: 'let x = 10;\nlet y = 20;\n[x, y] = [y, x];\nconsole.log(x);',
    options: ['10', '20', '30', 'undefined'],
    answer: '20',
    explanation: 'Destructuring assignment can be used to swap variables.'
  },
  {
    code: 'let x = "hello";\nlet { length } = x;\nconsole.log(length);',
    options: ['5', 'undefined', 'error', 'hello'],
    answer: '5',
    explanation: 'Destructuring can access properties of strings (which are objects under the hood).'
  },
  {
    code: 'let x = [1, 2, 3];\nfor (let n of x) {\n  if (n === 2) break;\n}\nconsole.log(n);',
    options: ['1', '2', 'undefined', 'error'],
    answer: 'error',
    explanation: 'n is block-scoped to the for...of loop and not accessible outside.'
  },
  {
    code: 'let x = { a: 1, b: 2 };\nfor (let key in x) {\n  console.log(key);\n}',
    options: ['a, b', '1, 2', 'key', 'undefined'],
    answer: 'a, b',
    explanation: 'for...in iterates over the keys of an object.'
  },
  {
    code: 'let x = 10;\nlet y = x > 5 ? (x < 15 ? 1 : 2) : 3;\nconsole.log(y);',
    options: ['1', '2', '3', '10'],
    answer: '1',
    explanation: 'Nested ternary: 10 > 5 is true, then 10 < 15 is true, so 1.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x.map(n => n > 1);\nconsole.log(y[0]);',
    options: ['1', 'true', 'false', 'undefined'],
    answer: 'false',
    explanation: 'map returns [false, true, true]. Index 0 is false.'
  },
  {
    code: 'let x = "123";\nconsole.log(x === 123);',
    options: ['true', 'false', 'undefined', 'error'],
    answer: 'false',
    explanation: 'Strict equality checks type; string is not number.'
  },
  {
    code: 'let x = undefined;\nconsole.log(x || "default");',
    options: ['undefined', 'default', 'null', 'error'],
    answer: 'default',
    explanation: 'undefined is falsy, so OR returns the second operand.'
  },
  {
    code: 'let x = null;\nconsole.log(x ?? "default");',
    options: ['null', 'default', 'undefined', 'error'],
    answer: 'default',
    explanation: 'The nullish coalescing operator (??) returns the second operand if the first is null or undefined.'
  },
  {
    code: 'let x = 0;\nconsole.log(x ?? "default");',
    options: ['0', 'default', 'undefined', 'error'],
    answer: '0',
    explanation: '?? only triggers for null or undefined. 0 is a valid value.'
  },
  {
    code: 'let x = "";\nconsole.log(x || "default");',
    options: ['', 'default', 'undefined', 'error'],
    answer: 'default',
    explanation: 'Empty string is falsy, so || returns "default".'
  },
  {
    code: 'let x = "";\nconsole.log(x ?? "default");',
    options: ['', 'default', 'undefined', 'error'],
    answer: '',
    explanation: '?? only triggers for null or undefined. Empty string is neither.'
  },
  {
    code: 'let x = [1, 2, 3];\nlet y = x;\nx = [4, 5, 6];\nconsole.log(y[0]);',
    options: ['1', '4', 'undefined', 'error'],
    answer: '1',
    explanation: 'y still points to the original array even after x is reassigned to a new one.'
  }
];
