// O(n)
function addUpToVersion1(n) {
  var total = 0;
  for (var i = 0; i <= n; i++) {
    total += i;
  }
  return total;
}

// O(1)
function addUpToVersion2(n) {
  return n * (n + 1) / 2;
}

// Other O(n)
function countUpBy1(n) {
  for (var i = 0; i < n; i++) {
    console.log(i);
  }
  console.log("Done. Bye!");
}

// Other O(n)
function countUpBy2(n) {
  for (var i = 0; i < n; i+=2) {
    console.log(i);
  }
  console.log("Done. Bye!");
}

// Other O(n)
function countUpAndDown(n) {
  console.log("Going up!");
  for (var i = 0; i < n; i++) {
    console.log(i);
  }
  console.log("At the top!\nGoing down...");
  for (var j = n - 1; j >= 0; j--) {
    console.log(j);
  }
  console.log("Back down. Bye!");
}

// O(n^2)
function printAllPairs(n) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      console.log(i, j);
    }
  }
}

// O(log(n))
function numberOfHalves(n) {
  var count = 0;
  while (n > 1) {
    n /= 2;
    count++;
  }
  return count;
}

// O(n * log(n))
function totalNumberOfHalves(n) {
  var total = 0;
  for (var i = 0; i < n; i++) {
    total += numberOfHalves(n);
  }
  return total;
}

let functions = [
  {
    fn: countUpBy1,
    className: "primary",
    fnJavaScript:"function countUpBy1(n) {\n    for (let i = 0; i < n; i++) {\n        console.log(i);\n    }\n}",
    color: "#3978FF",
    bigOh: function(n) {return n;}
  },

  {
    fn: countUpBy2,
    className: "secondary",
    fnJavaScript:"function countUpBy2(n) {\n    for (let i = 0; i < n; i += 2) {\n        console.log(i);\n    }\n}",
    color: "#6E757D",
    bigOh: function(n) {return n/2;}
  },
  {
    fn: countUpAndDown,
    fnJavaScript:'function countUpAndDown(n) {\n      console.log("Going up!")\n      for (let i = 0; i <= n; i++) {\n            console.log(i);\n      }\n      console.log("At the top! Going down...");\n      for (let j = n -1; j >= 0; j--) {\n            console.log(j);\n      }\n      console.log("Done!");\n}\n',
    className: "warning",
    color: "#F6C40C",
    bigOh: function(n) {return 2*n;}
  },
  {
    fn: addUpToVersion1,
    className: "success",
    fnJavaScript:"function addUpToVersion1(n) {\n      total = 0;\n      for (i = 1; i <= n; i++) {\n        total += i;\n      }\n      return total;\n}",
    color: "#4CA442",
    bigOh: function(n) {return n;}
  },
  {
    fn: addUpToVersion2,
    className: "danger",
    fnJavaScript:"function addUpToVersion2(n) {\n      return n * (n + 1) / 2;\n}",
    color: "#CD4748",
    bigOh: function(n) {return 1;}
  },
  {
    fn: printAllPairs,
    fnJavaScript:"function printAllPairs(n) {\n      for(let i = 0; i < n; i++) {\n        for(let j = 0; j < n; j++) {\n          console.log(i, j);\n        }\n      }\n}",
    className: "info",
    color: "#479FB8",
    bigOh: function(n) {return n * n;}
  },
  {
    fn: numberOfHalves,
    fnJavaScript: "function numberOfHalves(n) {\n      let count = 0;\n       while (n > 1) {\n         n = n / 2;\n         count++;\n       }\n       return count;\n}",
    className: "dark",
    color: "#353A40",
    bigOh: function(n) {return Math.log(n) / Math.log(2);}
  },
  {
    fn: totalNumberOfHalves,
    fnJavaScript:"function totalNumberOfHalves(n) {\n      let total = 0\n      for (let i = 0; i < n; i++) {\n        total += numberOfHalves(n);\n      }\n      return total\n}",
    className: "primary",
    color: "#543E7C",
    bigOh: function(n) {return n * Math.log(n) / Math.log(2);}
  },
];

onmessage = function(event) {
  let name = event.data.name;
  let input = event.data.input;
  let fnData = functions.find(obj => obj.fn.name === name);
  let t1 = performance.now();
  fnData.fn(input);
  let t2 = performance.now();
  postMessage({type: "end", time: t2 - t1, color: fnData.color});
};