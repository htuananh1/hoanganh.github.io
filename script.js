document.addEventListener("DOMContentLoaded", () => {
  const expressionDisplay = document.getElementById("expression-display");
  const resultDisplay = document.getElementById("result-display");
  const keypadElement = document.getElementById("keypad");
  const modeSelect = document.getElementById("mode-select");
  const angleSelect = document.getElementById("angle-select");
  const statusMode = document.querySelector('[data-status="mode"]');
  const statusAngle = document.querySelector('[data-status="angle"]');
  const statusShift = document.querySelector('[data-status="shift"]');
  const statusAlpha = document.querySelector('[data-status="alpha"]');
  const conversionTypeSelect = document.getElementById("conversion-type");
  const fromUnitSelect = document.getElementById("from-unit");
  const toUnitSelect = document.getElementById("to-unit");
  const conversionInput = document.getElementById("conversion-input");
  const conversionOutput = document.getElementById("conversion-output");
  const convertButton = document.getElementById("convert-button");
  const inequalityInput = document.getElementById("inequality-input");
  const inequalityRange = document.getElementById("inequality-range");
  const inequalityResult = document.getElementById("inequality-result");
  const inequalityButton = document.getElementById("solve-inequality");

  const mathInstance = math.create(math.all);
  mathInstance.config({ number: "BigNumber", precision: 40 });

  const bn = value => mathInstance.bignumber(value);
  const degToRad = mathInstance.divide(mathInstance.pi, bn(180));
  const radToDeg = mathInstance.divide(bn(180), mathInstance.pi);

  const baseTrig = {
    sin: mathInstance.sin,
    cos: mathInstance.cos,
    tan: mathInstance.tan,
    asin: mathInstance.asin,
    acos: mathInstance.acos,
    atan: mathInstance.atan
  };

  mathInstance.import(
    {
      sin: value => baseTrig.sin(convertToRadians(value)),
      cos: value => baseTrig.cos(convertToRadians(value)),
      tan: value => baseTrig.tan(convertToRadians(value)),
      asin: value => convertFromRadians(baseTrig.asin(value)),
      acos: value => convertFromRadians(baseTrig.acos(value)),
      atan: value => convertFromRadians(baseTrig.atan(value)),
      logab: (a, b) => mathInstance.log(b, a),
      comb: (n, r) => mathInstance.combinations(n, r),
      perm: (n, r) => mathInstance.permutations(n, r),
      Abs: value => mathInstance.abs(value)
    },
    { override: true }
  );

  const keyLayout = [
    [
      { label: "SHIFT", action: "shift", classes: ["function", "key--shift"] },
      { label: "ALPHA", action: "alpha", classes: ["function", "key--alpha"] },
      { label: "MODE", action: "mode", shiftLabel: "SETUP", shiftAction: "setup", classes: ["function"] },
      { label: "CALC", action: "calc", shiftLabel: "TABLE", shiftAction: "table", classes: ["function"] },
      { label: "SOLVE", action: "solve", shiftLabel: "d/dx", shiftAction: "derivative", classes: ["function"] },
      { label: "ON", action: "on", shiftLabel: "OFF", shiftAction: "off", classes: ["function", "key--on"] }
    ],
    [
      { label: "x⁻¹", action: "reciprocal", shiftLabel: "Abs", shiftAction: "abs", classes: ["function"] },
      { label: "x²", action: "square", shiftLabel: "√x", shiftAction: "sqrt", classes: ["function"] },
      { label: "√x", action: "sqrt", shiftLabel: "x³", shiftAction: "cube", classes: ["function"] },
      { label: "xʸ", action: "power", shiftLabel: "y√x", shiftAction: "nthRoot", classes: ["function"] },
      { label: "log", input: "log(", shiftLabel: "10ˣ", shiftAction: "tenPower", classes: ["function"] },
      { label: "ln", input: "ln(", shiftLabel: "eˣ", shiftAction: "exp", classes: ["function"] }
    ],
    [
      { label: "sin", input: "sin(", shiftLabel: "sin⁻¹", shiftInput: "asin(", classes: ["function"] },
      { label: "cos", input: "cos(", shiftLabel: "cos⁻¹", shiftInput: "acos(", classes: ["function"] },
      { label: "tan", input: "tan(", shiftLabel: "tan⁻¹", shiftInput: "atan(", classes: ["function"] },
      { label: "π", input: "pi", shiftLabel: "Rnd", shiftAction: "round", classes: ["function"] },
      { label: "(-)", action: "negate", shiftLabel: "ENG", shiftAction: "eng" },
      { label: "Abs", action: "abs", shiftLabel: "Hyp", shiftAction: "hyp", classes: ["function"] }
    ],
    [
      { label: "a⁄b", action: "fraction", shiftLabel: "d/c", shiftAction: "fractionDecimal" },
      { label: "×10ˣ", action: "pow10", shiftLabel: "F↔E", shiftAction: "toggleFormat" },
      { label: "logₐb", action: "logab", shiftLabel: "√[x]y", shiftAction: "nthRoot" },
      { label: "(", input: "(", classes: ["function"] },
      { label: ")", input: ")", classes: ["function"] },
      { label: "DEL", action: "del", shiftLabel: "INS", shiftAction: "insert", classes: ["function"] }
    ],
    [
      { label: "7", input: "7", alphaLabel: "A", alphaInput: "A", classes: ["numeric"] },
      { label: "8", input: "8", alphaLabel: "B", alphaInput: "B", classes: ["numeric"] },
      { label: "9", input: "9", alphaLabel: "C", alphaInput: "C", classes: ["numeric"] },
      { label: "÷", input: "/", shiftLabel: "%", shiftAction: "percent", classes: ["operator"] },
      { label: "×", input: "*", classes: ["operator"] },
      { label: "AC", action: "clear", shiftLabel: "OFF", shiftAction: "off", classes: ["danger"] }
    ],
    [
      { label: "4", input: "4", alphaLabel: "D", alphaInput: "D", classes: ["numeric"] },
      { label: "5", input: "5", alphaLabel: "E", alphaInput: "E", classes: ["numeric"] },
      { label: "6", input: "6", alphaLabel: "F", alphaInput: "F", classes: ["numeric"] },
      { label: "-", input: "-", classes: ["operator"] },
      { label: "+", input: "+", classes: ["operator"] },
      { label: "M+", action: "memoryPlus", shiftLabel: "M-", shiftAction: "memoryMinus", classes: ["function"] }
    ],
    [
      { label: "1", input: "1", alphaLabel: "X", alphaInput: "X", classes: ["numeric"] },
      { label: "2", input: "2", alphaLabel: "Y", alphaInput: "Y", classes: ["numeric"] },
      { label: "3", input: "3", alphaLabel: "Z", alphaInput: "Z", classes: ["numeric"] },
      { label: ",", input: ",", shiftLabel: "×10", shiftAction: "pow10", classes: ["function"] },
      { label: ".", input: ".", shiftLabel: "e", shiftInput: "e", classes: ["function"] },
      { label: "M", action: "memoryRecall", shiftLabel: "CLR", shiftAction: "memoryClear", classes: ["function"] }
    ],
    [
      { label: "0", input: "0", alphaLabel: "M", alphaInput: "M", classes: ["numeric"], width: 2 },
      { label: "EXP", action: "expInput", shiftLabel: "×10", shiftAction: "pow10", classes: ["function"] },
      { label: "Ans", action: "ans", shiftLabel: "STO", shiftAction: "sto", classes: ["function"] },
      { label: "=", action: "equals", classes: ["equals"], width: 2 }
    ]
  ];

  const unitDefinitions = {
    length: {
      km: { label: "Kilômét (km)", factor: bn(1000) },
      m: { label: "Mét (m)", factor: bn(1) },
      cm: { label: "Xentimét (cm)", factor: bn(0.01) },
      mm: { label: "Milimét (mm)", factor: bn(0.001) },
      in: { label: "Inch (in)", factor: bn(0.0254) },
      ft: { label: "Feet (ft)", factor: bn(0.3048) },
      yd: { label: "Yard (yd)", factor: bn(0.9144) }
    },
    mass: {
      t: { label: "Tấn (t)", factor: bn(1000) },
      kg: { label: "Kilôgam (kg)", factor: bn(1) },
      g: { label: "Gam (g)", factor: bn(0.001) },
      mg: { label: "Miligam (mg)", factor: bn(0.000001) },
      lb: { label: "Pao (lb)", factor: bn(0.45359237) },
      oz: { label: "Ounce (oz)", factor: bn(0.028349523125) }
    },
    temperature: {
      c: { label: "Độ C (°C)" },
      f: { label: "Độ F (°F)" },
      k: { label: "Kelvin (K)" }
    },
    area: {
      "m²": { label: "Mét vuông (m²)", factor: bn(1) },
      "cm²": { label: "Xentimét vuông (cm²)", factor: bn(0.0001) },
      "mm²": { label: "Milimét vuông (mm²)", factor: bn(0.000001) },
      "km²": { label: "Kilômét vuông (km²)", factor: bn(1000000) },
      ha: { label: "Hecta (ha)", factor: bn(10000) },
      "ft²": { label: "Feet vuông (ft²)", factor: bn(0.09290304) },
      "in²": { label: "Inch vuông (in²)", factor: bn(0.00064516) }
    },
    volume: {
      "m³": { label: "Mét khối (m³)", factor: bn(1) },
      l: { label: "Lít (L)", factor: bn(0.001) },
      ml: { label: "Mililit (mL)", factor: bn(0.000001) },
      "cm³": { label: "Xentimét khối (cm³)", factor: bn(0.000001) },
      "in³": { label: "Inch khối (in³)", factor: bn(0.000016387064) },
      "ft³": { label: "Feet khối (ft³)", factor: bn(0.028316846592) }
    }
  };

  const memoryRegisters = {};

  let expression = "";
  let displayExpression = "";
  let resultValue = bn(0);
  let ansValue = bn(0);
  let shiftActive = false;
  let alphaActive = false;
  let justEvaluated = false;
  let storeTargetPending = false;
  let memoryValue = bn(0);
  let memoryActive = false;

  buildKeypad();
  populateUnits(conversionTypeSelect.value);
  convertUnits();
  updateDisplay();

  keypadElement.addEventListener("click", handleKeypadClick);
  modeSelect.addEventListener("change", () => {
    resultValue = bn(0);
    updateDisplay();
  });
  angleSelect.addEventListener("change", updateDisplay);
  conversionTypeSelect.addEventListener("change", () => {
    populateUnits(conversionTypeSelect.value);
    convertUnits();
  });
  convertButton.addEventListener("click", convertUnits);
  conversionInput.addEventListener("input", convertUnits);
  fromUnitSelect.addEventListener("change", convertUnits);
  toUnitSelect.addEventListener("change", convertUnits);

  inequalityButton.addEventListener("click", () => {
    const inequality = inequalityInput.value.trim();
    if (!inequality) {
      inequalityResult.textContent = "Vui lòng nhập bất phương trình.";
      return;
    }
    const range = clamp(parseFloat(inequalityRange.value) || 50, 1, 500);
    try {
      const solution = solveInequality(inequality, range);
      inequalityResult.textContent = solution;
    } catch (error) {
      inequalityResult.textContent = "Không thể giải bất phương trình.";
    }
  });

  document.addEventListener("keydown", event => {
    if (event.defaultPrevented) return;
    const { key } = event;
    if (/^[0-9]$/.test(key)) {
      insertInput(key);
      updateDisplay();
      return;
    }
    if (["+", "-", "*", "/", "(", ")", ".", ","].includes(key)) {
      insertInput(key);
      updateDisplay();
      return;
    }
    if (key === "Enter" || key === "=") {
      evaluate();
      updateDisplay();
      event.preventDefault();
      return;
    }
    if (key === "Backspace") {
      deleteLast();
      updateDisplay();
      event.preventDefault();
      return;
    }
    if (key === "Escape") {
      clearAll();
      updateDisplay();
      event.preventDefault();
    }
  });

  function buildKeypad() {
    keypadElement.innerHTML = "";
    keyLayout.forEach(row => {
      row.forEach(key => {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("key");
        if (key.classes) {
          key.classes.forEach(cls => button.classList.add(cls));
        }
        if (key.input) {
          button.dataset.input = key.input;
        }
        if (key.action) {
          button.dataset.action = key.action;
        }
        if (key.shiftInput) {
          button.dataset.shiftInput = key.shiftInput;
        }
        if (key.shiftAction) {
          button.dataset.shiftAction = key.shiftAction;
        }
        if (key.alphaInput) {
          button.dataset.alphaInput = key.alphaInput;
        }
        if (key.alphaAction) {
          button.dataset.alphaAction = key.alphaAction;
        }
        if (key.width && key.width > 1) {
          button.style.gridColumn = `span ${key.width}`;
        }

        button.innerHTML = `${
          key.shiftLabel
            ? `<span class="key-legend key-legend--shift">${key.shiftLabel}</span>`
            : ""
        }${
          key.alphaLabel
            ? `<span class="key-legend key-legend--alpha">${key.alphaLabel}</span>`
            : ""
        }<span class="key-label">${key.label}</span>`;

        keypadElement.appendChild(button);
      });
    });
  }

  function handleKeypadClick(event) {
    const button = event.target.closest("button.key");
    if (!button) return;

    const baseAction = button.dataset.action;
    if (baseAction === "shift") {
      shiftActive = !shiftActive;
      if (shiftActive) alphaActive = false;
      updateIndicators();
      return;
    }
    if (baseAction === "alpha") {
      alphaActive = !alphaActive;
      if (alphaActive) shiftActive = false;
      updateIndicators();
      return;
    }

    const resolution = resolveKeyPress(button);

    if (storeTargetPending) {
      if (resolution.alphaValue) {
        storeRegister(resolution.alphaValue);
      } else {
        resultValue = "Chọn biến bằng phím ALPHA.";
      }
      storeTargetPending = false;
      shiftActive = false;
      alphaActive = false;
      justEvaluated = false;
      updateDisplay();
      return;
    }

    let shouldUpdate = false;

    if (resolution.action) {
      shouldUpdate = handleAction(resolution.action) || shouldUpdate;
    } else if (resolution.input) {
      insertInput(resolution.input);
      shouldUpdate = true;
    }

    if (resolution.usedShift) {
      shiftActive = false;
    }
    if (resolution.usedAlpha) {
      alphaActive = false;
    }

    if (shouldUpdate) {
      updateDisplay();
    } else {
      updateIndicators();
    }
  }

  function resolveKeyPress(button) {
    const result = { action: null, input: null, usedShift: false, usedAlpha: false, alphaValue: null };

    if (shiftActive) {
      if (button.dataset.shiftAction || button.dataset.shiftInput) {
        result.action = button.dataset.shiftAction || null;
        result.input = button.dataset.shiftInput || null;
        result.usedShift = true;
        return result;
      }
      result.usedShift = true;
    }

    if (alphaActive) {
      if (button.dataset.alphaAction || button.dataset.alphaInput) {
        result.action = button.dataset.alphaAction || null;
        result.input = button.dataset.alphaInput || null;
        result.usedAlpha = true;
        if (button.dataset.alphaInput) {
          result.alphaValue = button.dataset.alphaInput;
        }
        return result;
      }
      result.usedAlpha = true;
    }

    result.action = button.dataset.action || null;
    result.input = button.dataset.input || null;
    if (button.dataset.alphaInput) {
      result.alphaValue = button.dataset.alphaInput;
    }
    return result;
  }

  function updateDisplay() {
    const shownExpression = expression || displayExpression || "0";
    expressionDisplay.innerHTML = formatExpression(shownExpression, modeSelect.value);
    resultDisplay.textContent = typeof resultValue === "string"
      ? resultValue
      : formatResult(resultValue, modeSelect.value);
    updateIndicators();
  }

  function updateIndicators() {
    statusMode.textContent = modeSelect.value === "math" ? "MATH" : "DEC";
    statusAngle.textContent = angleSelect.value === "deg" ? "DEG" : "RAD";
    statusShift.dataset.active = shiftActive ? "true" : "false";
    statusAlpha.dataset.active = alphaActive ? "true" : "false";
  }

  function insertInput(value) {
    if (!value) return;
    if (!justEvaluated && !expression && (value.startsWith("^") || value.startsWith("×"))) {
      expression = `Ans${value}`;
      displayExpression = "";
      justEvaluated = false;
      return;
    }
    if (justEvaluated) {
      if (shouldContinueWithAns(value)) {
        expression = `Ans${value}`;
      } else {
        expression = value;
      }
      displayExpression = "";
    } else {
      expression += value;
    }
    justEvaluated = false;
  }

  function shouldContinueWithAns(value) {
    const prefixes = ["+", "-", "*", "/", "^", ",", ")", "!"];
    return prefixes.some(prefix => value.startsWith(prefix)) || value.startsWith("×");
  }

  function clearAll() {
    expression = "";
    displayExpression = "";
    resultValue = bn(0);
    ansValue = bn(0);
    justEvaluated = false;
    storeTargetPending = false;
  }

  function deleteLast() {
    if (expression) {
      expression = expression.slice(0, -1);
    } else if (justEvaluated && displayExpression) {
      expression = displayExpression.slice(0, -1);
      displayExpression = "";
      justEvaluated = false;
    }
  }

  function insertAns() {
    insertInput("Ans");
  }

  function toggleSign() {
    if (!expression) {
      if (typeof resultValue !== "string" && resultValue !== null) {
        expression = `(-${formatNumber(resultValue)})`;
      }
      return;
    }
    const match = expression.match(/(-?\d*\.?\d+)(?!.*\d)/);
    if (match) {
      const number = match[0];
      const inverted = number.startsWith("-") ? number.slice(1) : `-${number}`;
      expression =
        expression.slice(0, match.index) + inverted + expression.slice(match.index + number.length);
    } else {
      expression = `(-1)*(${expression})`;
    }
  }

  function handleAction(action) {
    switch (action) {
      case "clear":
        clearAll();
        return true;
      case "del":
        deleteLast();
        return true;
      case "ans":
        insertAns();
        return true;
      case "equals":
        evaluate();
        return true;
      case "sqrt":
        insertInput("sqrt(");
        return true;
      case "power":
        insertInput("^");
        return true;
      case "reciprocal":
        insertInput("^(-1)");
        return true;
      case "square":
        insertInput("^2");
        return true;
      case "cube":
        insertInput("^3");
        return true;
      case "tenPower":
        insertInput("10^(");
        return true;
      case "exp":
        insertInput("exp(");
        return true;
      case "fraction":
        handleFraction();
        return true;
      case "fractionDecimal":
        handleFractionDecimal();
        return true;
      case "pow10":
        insertInput("×10^(");
        return true;
      case "logab":
        insertInput("logab(");
        return true;
      case "combination":
        insertInput("comb(");
        return true;
      case "permutation":
        insertInput("perm(");
        return true;
      case "factorial":
        insertInput("!");
        return true;
      case "abs":
        insertInput("Abs(");
        return true;
      case "nthRoot":
        insertInput("nthRoot(");
        return true;
      case "negate":
        toggleSign();
        return true;
      case "mode":
        modeSelect.value = modeSelect.value === "math" ? "decimal" : "math";
        resultValue = `Chế độ: ${modeSelect.options[modeSelect.selectedIndex].textContent}`;
        justEvaluated = false;
        return true;
      case "calc":
        resultValue = "CALC: Nhập giá trị biến bằng ALPHA và ấn =.";
        justEvaluated = false;
        return true;
      case "solve":
        resultValue = "SOLVE: Chức năng giải phương trình sẽ sớm có.";
        justEvaluated = false;
        return true;
      case "setup":
        resultValue = "SETUP: Điều chỉnh trong menu.";
        justEvaluated = false;
        return true;
      case "stat":
        resultValue = "STAT: Chức năng thống kê sẽ sớm có.";
        justEvaluated = false;
        return true;
      case "table":
        resultValue = "TABLE: Nhập hàm để lập bảng.";
        justEvaluated = false;
        return true;
      case "derivative":
        handleDerivative();
        return true;
      case "on":
        clearAll();
        resultValue = "CASIO fx-580VN Plus";
        return true;
      case "off":
        powerOff();
        return true;
      case "eng":
        resultValue = "ENG: Định dạng kỹ thuật chưa hỗ trợ.";
        justEvaluated = false;
        return true;
      case "round":
        resultValue = "Rnd: Chức năng làm tròn ngẫu nhiên chưa hỗ trợ.";
        justEvaluated = false;
        return true;
      case "percent":
        resultValue = "%: Chức năng phần trăm chưa hỗ trợ.";
        justEvaluated = false;
        return true;
      case "hyp":
        resultValue = "Hyp: Hàm hyperbolic sẽ được bổ sung sau.";
        justEvaluated = false;
        return true;
      case "toggleFormat":
        resultValue = "F↔E: Định dạng kỹ thuật chưa hỗ trợ.";
        justEvaluated = false;
        return true;
      case "memoryPlus":
        memoryPlus();
        return true;
      case "memoryMinus":
        memoryMinus();
        return true;
      case "memoryRecall":
        memoryRecall();
        return true;
      case "memoryClear":
        memoryClear();
        return true;
      case "expInput":
        insertInput("×10^(");
        return true;
      case "insert":
        resultValue = "INS: Chế độ chèn chưa hỗ trợ.";
        justEvaluated = false;
        return true;
      case "sto":
        storeTargetPending = true;
        alphaActive = true;
        shiftActive = false;
        resultValue = "Chọn biến ALPHA để lưu Ans.";
        return true;
      default:
        return false;
    }
  }

  function handleFraction() {
    if (typeof resultValue === "string") {
      if (/^-?\d+\/\d+$/.test(resultValue)) {
        const [numerator, denominator] = resultValue.split("/").map(Number);
        if (denominator !== 0) {
          const decimal = mathInstance.divide(bn(numerator), bn(denominator));
          resultValue = formatNumber(decimal, 12);
        }
      }
      return;
    }
    const fraction = toFraction(resultValue);
    if (fraction) {
      if (fraction.denominator === 1) {
        resultValue = String(fraction.numerator);
      } else {
        resultValue = `${fraction.numerator}/${fraction.denominator}`;
      }
    } else {
      resultValue = formatResult(resultValue, modeSelect.value);
    }
  }

  function handleFractionDecimal() {
    if (typeof resultValue === "string" && /^-?\d+\/\d+$/.test(resultValue)) {
      const [numerator, denominator] = resultValue.split("/").map(Number);
      if (denominator !== 0) {
        const decimal = mathInstance.divide(bn(numerator), bn(denominator));
        resultValue = formatNumber(decimal, 12);
      }
    } else {
      handleFraction();
    }
  }

  function convertToRadians(value) {
    if (angleSelect.value === "rad") return value;
    return mathInstance.multiply(value, degToRad);
  }

  function convertFromRadians(value) {
    if (angleSelect.value === "rad") return value;
    return mathInstance.multiply(value, radToDeg);
  }

  function formatExpression(exp, mode) {
    if (!exp) return "0";
    return exp
      .replace(/sqrt\(/g, "√(")
      .replace(/nthRoot\(/g, "ⁿ√(")
      .replace(/exp\(/g, "e^(")
      .replace(/\*/g, mode === "math" ? "×" : "*")
      .replace(/\//g, mode === "math" ? "÷" : "/")
      .replace(/pi/g, "π")
      .replace(/Ans/g, "Ans");
  }

  function toNumber(value) {
    if (mathInstance.isBigNumber(value)) {
      return Number(value.toString());
    }
    if (mathInstance.isFraction && mathInstance.isFraction(value)) {
      return value.valueOf();
    }
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }

  function formatNumber(value, precision = 14) {
    return mathInstance.format(value, { notation: "auto", precision });
  }

  function toFraction(value, maxDenominator = 1000, tolerance = 1e-10) {
    const numberValue = toNumber(value);
    if (!Number.isFinite(numberValue)) return null;
    const sign = Math.sign(numberValue);
    const absValue = Math.abs(numberValue);
    const integerPart = Math.floor(absValue);
    let fractionPart = absValue - integerPart;
    if (fractionPart < tolerance) {
      return { numerator: sign * integerPart, denominator: 1 };
    }
    let lowerN = 0;
    let lowerD = 1;
    let upperN = 1;
    let upperD = 1;
    while (true) {
      const middleN = lowerN + upperN;
      const middleD = lowerD + upperD;
      if (middleD > maxDenominator) break;
      const middleValue = middleN / middleD;
      if (Math.abs(middleValue - fractionPart) < tolerance) {
        return {
          numerator: sign * (integerPart * middleD + middleN),
          denominator: middleD
        };
      }
      if (middleValue < fractionPart) {
        lowerN = middleN;
        lowerD = middleD;
      } else {
        upperN = middleN;
        upperD = middleD;
      }
    }
    return null;
  }

  function formatResult(value, mode) {
    if (typeof value === "string") {
      return value;
    }
    if (mathInstance.isMatrix && mathInstance.isMatrix(value)) {
      return "Không hỗ trợ ma trận";
    }
    const numericValue = mathInstance.isBigNumber(value)
      ? value
      : mathInstance.isFraction && mathInstance.isFraction(value)
      ? mathInstance.bignumber(value.valueOf())
      : typeof value === "number"
      ? mathInstance.bignumber(value)
      : value;

    if (mode === "decimal") {
      return formatNumber(numericValue);
    }
    const fraction = toFraction(numericValue);
    if (fraction) {
      if (fraction.denominator === 1) {
        return String(fraction.numerator);
      }
      return `${fraction.numerator}⁄${fraction.denominator}`;
    }
    return formatNumber(numericValue);
  }

  function evaluateExpression(exp, scope = {}) {
    return mathInstance.evaluate(exp, { ...getRegisterScope(), Ans: ansValue, ...scope });
  }

  function getRegisterScope() {
    const scope = {};
    Object.entries(memoryRegisters).forEach(([letter, value]) => {
      scope[letter] = value;
    });
    return scope;
  }

  function prepareExpression(exp) {
    let prepared = exp
      .replace(/π/g, "pi")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/--/g, "+")
      .replace(/log\(/g, "log10(")
      .replace(/Abs\(/g, "Abs(")
      .replace(/abs\(/g, "Abs(")
      .replace(/√\(/g, "sqrt(");

    prepared = prepared.replace(/\s+/g, "");

    if (/[^0-9+\-*/().,!^A-Za-z_]/.test(prepared)) {
      throw new Error("Ký tự không hợp lệ");
    }

    const factorialRegex = /(\([^()]*\)|[\d.]+)!/g;
    while (factorialRegex.test(prepared)) {
      prepared = prepared.replace(factorialRegex, "factorial($1)");
    }

    prepared = insertImplicitMultiplication(prepared);
    return prepared;
  }

  function insertImplicitMultiplication(exp) {
    return exp
      .replace(/(\d)([A-Za-z(])/g, "$1*$2")
      .replace(/(\))(\d)/g, "$1*$2")
      .replace(/(\))(\()/g, "$1*$2")
      .replace(/(Ans)(\d)/g, "$1*$2")
      .replace(/(Ans)(\()/g, "$1*$2");
  }

  function evaluate() {
    const workingExpression = expression || displayExpression;
    if (!workingExpression) return;
    try {
      const prepared = prepareExpression(workingExpression);
      const value = evaluateExpression(prepared);
      resultValue = value;
      if (typeof value !== "string") {
        ansValue = mathInstance.isBigNumber(value)
          ? value
          : mathInstance.bignumber(toNumber(value));
      }
      displayExpression = workingExpression;
      expression = "";
      justEvaluated = true;
    } catch (error) {
      const message = getFriendlyError(error);
      resultValue = message;
      justEvaluated = false;
    }
  }

  function getFriendlyError(error) {
    if (error && error.message) {
      const undefinedMatch = error.message.match(/Undefined symbol (.+)/);
      if (undefinedMatch) {
        return `Biến ${undefinedMatch[1]} chưa được lưu.`;
      }
    }
    return "Lỗi cú pháp";
  }

  function convertUnits() {
    const type = conversionTypeSelect.value;
    const units = unitDefinitions[type];
    if (!units) return;
    const value = conversionInput.value;
    if (value === "") {
      conversionOutput.value = "";
      return;
    }
    const amount = bn(value);
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;

    let baseValue;
    if (type === "temperature") {
      baseValue = convertTemperatureToKelvin(amount, fromUnit);
      const converted = convertTemperatureFromKelvin(baseValue, toUnit);
      conversionOutput.value = formatNumber(converted, 12);
      return;
    }

    const fromFactor = units[fromUnit].factor;
    const toFactor = units[toUnit].factor;
    baseValue = mathInstance.multiply(amount, fromFactor);
    const converted = mathInstance.divide(baseValue, toFactor);
    conversionOutput.value = formatNumber(converted, 12);
  }

  function convertTemperatureToKelvin(value, unit) {
    switch (unit) {
      case "c":
        return mathInstance.add(value, bn(273.15));
      case "f":
        return mathInstance.add(
          mathInstance.divide(mathInstance.multiply(mathInstance.subtract(value, bn(32)), bn(5)), bn(9)),
          bn(273.15)
        );
      case "k":
      default:
        return value;
    }
  }

  function convertTemperatureFromKelvin(value, unit) {
    switch (unit) {
      case "c":
        return mathInstance.subtract(value, bn(273.15));
      case "f":
        return mathInstance.add(
          mathInstance.divide(mathInstance.multiply(mathInstance.subtract(value, bn(273.15)), bn(9)), bn(5)),
          bn(32)
        );
      case "k":
      default:
        return value;
    }
  }

  function populateUnits(type) {
    const units = unitDefinitions[type];
    if (!units) return;
    fromUnitSelect.innerHTML = "";
    toUnitSelect.innerHTML = "";
    Object.entries(units).forEach(([value, { label }], index) => {
      const optionFrom = document.createElement("option");
      optionFrom.value = value;
      optionFrom.textContent = label;
      fromUnitSelect.appendChild(optionFrom);

      const optionTo = document.createElement("option");
      optionTo.value = value;
      optionTo.textContent = label;
      toUnitSelect.appendChild(optionTo);

      if (index === 0) {
        optionFrom.selected = true;
      }
      if (index === 1) {
        optionTo.selected = true;
      }
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function solveInequality(input, range) {
    const operators = ["<=", ">=", "<", ">"];
    let operator = null;
    let left = "";
    let right = "";
    for (const op of operators) {
      const index = input.indexOf(op);
      if (index !== -1) {
        operator = op;
        left = input.slice(0, index).trim();
        right = input.slice(index + op.length).trim();
        break;
      }
    }
    if (!operator) {
      throw new Error("Không tìm thấy toán tử bất phương trình");
    }
    const preparedLeft = prepareExpression(left);
    const preparedRight = prepareExpression(right);
    const stepCount = 800;
    const minX = -range;
    const maxX = range;
    const step = (maxX - minX) / stepCount;
    const intervals = [];
    let currentStart = null;
    let previousSatisfied = false;

    for (let i = 0; i <= stepCount; i += 1) {
      const x = minX + i * step;
      let leftValue;
      let rightValue;
      try {
        leftValue = evaluateExpression(preparedLeft, { x });
        rightValue = evaluateExpression(preparedRight, { x });
      } catch (error) {
        continue;
      }
      const satisfied = checkInequality(toNumber(leftValue), toNumber(rightValue), operator);
      if (satisfied && !previousSatisfied) {
        currentStart = x;
      } else if (!satisfied && previousSatisfied) {
        intervals.push([currentStart, x - step]);
        currentStart = null;
      }
      previousSatisfied = satisfied;
    }

    if (previousSatisfied && currentStart !== null) {
      intervals.push([currentStart, maxX]);
    }

    if (!intervals.length) {
      return "Không có nghiệm trong phạm vi đã chọn.";
    }

    const inclusive = operator.includes("=");
    const startBracket = inclusive ? "[" : "(";
    const endBracket = inclusive ? "]" : ")";
    const formatted = intervals
      .map(([start, end]) => `${startBracket}${formatNumber(start)}, ${formatNumber(end)}${endBracket}`)
      .join(" ∪ ");
    return `Nghiệm x thuộc: ${formatted}`;
  }

  function checkInequality(left, right, operator) {
    switch (operator) {
      case "<":
        return left < right;
      case ">":
        return left > right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      default:
        return false;
    }
  }

  function handleDerivative() {
    if (!expression) {
      resultValue = "d/dx: Nhập hàm theo x rồi ấn =.";
      justEvaluated = false;
      return;
    }
    try {
      const prepared = prepareExpression(expression);
      const derivative = mathInstance.derivative(prepared, "x").toString();
      resultValue = `d/dx = ${formatExpression(derivative, modeSelect.value)}`;
    } catch (error) {
      resultValue = "Không thể tính đạo hàm.";
    }
    justEvaluated = false;
  }

  function powerOff() {
    clearAll();
    shiftActive = false;
    alphaActive = false;
    resultValue = "Máy đã tắt. Ấn ON để khởi động.";
    displayExpression = "";
    justEvaluated = false;
  }

  function memoryPlus() {
    memoryValue = memoryActive ? mathInstance.add(memoryValue, ansValue) : ansValue;
    memoryActive = true;
    resultValue = `M = ${formatNumber(memoryValue)}`;
    justEvaluated = false;
  }

  function memoryMinus() {
    memoryValue = memoryActive ? mathInstance.subtract(memoryValue, ansValue) : mathInstance.multiply(ansValue, bn(-1));
    memoryActive = true;
    resultValue = `M = ${formatNumber(memoryValue)}`;
    justEvaluated = false;
  }

  function memoryRecall() {
    if (!memoryActive) {
      resultValue = "Bộ nhớ trống.";
      justEvaluated = false;
      return;
    }
    insertInput(formatNumber(memoryValue));
    justEvaluated = false;
  }

  function memoryClear() {
    memoryValue = bn(0);
    memoryActive = false;
    resultValue = "Đã xóa bộ nhớ (M).";
    justEvaluated = false;
  }

  function storeRegister(letter) {
    if (!letter) return;
    memoryRegisters[letter] = ansValue;
    resultValue = `Đã lưu Ans vào ${letter}`;
  }
});
