// --- 基础数据与工具函数 ---
const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const fiveElementsMap = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};
const branchToElement = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

const elementRelation = (from, to) => {
  // 简化：生我为印，我生为泄，克我为官，我克为财，同为比劫
  const cycle = ["木", "火", "土", "金", "水"];
  const i = cycle.indexOf(from);
  const j = cycle.indexOf(to);
  if (i === -1 || j === -1) return "无明显生克";
  if ((i + 1) % 5 === j) return "我生之星（泄）";
  if ((i + 4) % 5 === j) return "生我之星（印）";
  if ((i + 2) % 5 === j) return "我所克之星（财）";
  if ((i + 3) % 5 === j) return "克我之星（官）";
  return "同我之星（比劫）";
};

function getYearPillar(year) {
  // 以 1984 甲子年为基准
  const baseYear = 1984;
  const offset = year - baseYear;
  const stemIndex = ((offset % 10) + 10) % 10;
  const branchIndex = ((offset % 12) + 12) % 12;
  return {
    stem: heavenlyStems[stemIndex],
    branch: earthlyBranches[branchIndex],
  };
}

function getMonthPillar(yearStemIndex, month) {
  // 简化月干：以年干推算
  // 甲己年丙寅起, 乙庚年戊寅起, 丙辛年庚寅起, 丁壬年壬寅起, 戊癸年甲寅起
  const startStemIndexMap = {
    0: 2, // 甲 -> 丙
    5: 2, // 己 -> 丙
    1: 4, // 乙 -> 戊
    6: 4, // 庚 -> 戊
    2: 6, // 丙 -> 庚
    7: 6, // 辛 -> 庚
    3: 8, // 丁 -> 壬
    8: 8, // 壬 -> 壬
    4: 0, // 戊 -> 甲
    9: 0, // 癸 -> 甲
  };
  const startStemIndex = startStemIndexMap[yearStemIndex];
  const stemIndex = (startStemIndex + (month - 1)) % 10;
  // 寅月为正月
  const branchIndex = (2 + (month - 1)) % 12;
  return {
    stem: heavenlyStems[stemIndex],
    branch: earthlyBranches[branchIndex],
  };
}

function getDayPillar(date) {
  // 使用 1900-01-31 为甲子日的常用简化算法
  const base = new Date(1900, 0, 31);
  const diffDays = Math.floor((date - base) / 86400000);
  const index = ((diffDays % 60) + 60) % 60;
  const stemIndex = index % 10;
  const branchIndex = index % 12;
  return {
    stem: heavenlyStems[stemIndex],
    branch: earthlyBranches[branchIndex],
    stemIndex,
    branchIndex,
  };
}

function getHourBranch(hour) {
  const index = Math.floor(((hour + 1) % 24) / 2);
  return {
    index,
    branch: earthlyBranches[index],
  };
}

function getHourStem(dayStemIndex, hourBranchIndex) {
  // 甲己 日 甲子起; 乙庚 日 丙子起; 丙辛 日 戊子起; 丁壬 日 庚子起; 戊癸 日 壬子起
  const startStemIndexByDayStem = {
    0: 0,
    5: 0,
    1: 2,
    6: 2,
    2: 4,
    7: 4,
    3: 6,
    8: 6,
    4: 8,
    9: 8,
  };
  const startStemIndex = startStemIndexByDayStem[dayStemIndex];
  const stemIndex = (startStemIndex + hourBranchIndex) % 10;
  return heavenlyStems[stemIndex];
}

function isValidDate(y, m, d) {
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

function calculateBazi(y, m, d, h, min) {
  const date = new Date(y, m - 1, d, h || 0, min || 0);
  const yearPillar = getYearPillar(y);
  const yearStemIndex =
    heavenlyStems.indexOf(yearPillar.stem) >= 0
      ? heavenlyStems.indexOf(yearPillar.stem)
      : 0;
  const monthPillar = getMonthPillar(yearStemIndex, m);
  const dayPillar = getDayPillar(date);
  const hourBranch = getHourBranch(h || 0);
  const hourStem = getHourStem(dayPillar.stemIndex, hourBranch.index);

  return {
    year: yearPillar,
    month: monthPillar,
    day: {
      stem: dayPillar.stem,
      branch: dayPillar.branch,
    },
    hour: {
      stem: hourStem,
      branch: hourBranch.branch,
    },
  };
}

function getCurrentYearPillar() {
  const now = new Date();
  const year = now.getFullYear();
  return { year, pillar: getYearPillar(year) };
}

function getNextYearPillar() {
  const now = new Date();
  const year = now.getFullYear() + 1;
  return { year, pillar: getYearPillar(year) };
}

function getTodayPillar() {
  const now = new Date();
  return getDayPillar(now);
}

function analyzeFortune(bazi, gender, targetPillar, targetYear, periodType = "年") {
  const { year, month, day, hour } = bazi;
  const dayStem = day.stem;
  const dayElement = fiveElementsMap[dayStem];

  const flowStem = targetPillar.stem;
  const flowBranch = targetPillar.branch;
  const flowElementStem = fiveElementsMap[flowStem];
  const flowElementBranch = branchToElement[flowBranch];

  const relStem = elementRelation(dayElement, flowElementStem);
  const relBranch = elementRelation(dayElement, flowElementBranch);

  // 事业运
  let career = `【事业运】\n`;
  if (relStem.includes("官")) {
    if (periodType === "日") {
      career +=
        "今日官星较旺，适合处理重要工作、做决策，宜主动承担责任，多与上级沟通。\n";
    } else {
      career +=
        "流年官星较旺，适合在体制、职场中争取职位与权责，宜稳中有进，多听长辈上司之言。\n";
    }
  } else if (relStem.includes("印")) {
    if (periodType === "日") {
      career +=
        "今日印星得力，适合学习、阅读、思考，有利于提升专业能力，适合制定长期计划。\n";
    } else {
      career +=
        "流年印星得力，适合进修学习、考证深造，有利于职称提升与专业能力积累。\n";
    }
  } else if (relStem.includes("比劫")) {
    if (periodType === "日") {
      career +=
        "今日比劫之气偏重，人际互动较多，适合团队协作，但需注意避免不必要的竞争。\n";
    } else {
      career +=
        "比劫之气偏重，人际竞争略强，同事间易有比较之心，宜保持谦和，重视团队合作。\n";
    }
  } else {
    if (periodType === "日") {
      career +=
        "今日事业运势平稳，适合按部就班完成日常工作，保持专业态度，避免急躁。\n";
    } else {
      career +=
        "本年事业整体平稳，适合按部就班推进原有规划，保持专业与口碑，切忌急躁变动。\n";
    }
  }

  // 财运
  let wealth = `【财运】\n`;
  if (relStem.includes("财") || relBranch.includes("财")) {
    if (periodType === "日") {
      wealth +=
        "今日财星透出，适合处理财务事务、做理财规划，但需谨慎，避免冲动消费或投资。\n";
    } else {
      wealth +=
        "财星透出，理财意识增强，适合合理规划收支，亦可尝试谨慎投资，但需防贪心冒进。\n";
    }
  } else if (relStem.includes("比劫")) {
    if (periodType === "日") {
      wealth +=
        "今日比劫旺，易有社交消费、人情往来，注意控制支出，避免不必要的花费。\n";
    } else {
      wealth +=
        "比劫旺则有合伙、分摊之象，易有人情往来、聚会消费，注意控制支出，避免冲动购物。\n";
    }
  } else {
    if (periodType === "日") {
      wealth +=
        "今日财运平稳，适合按计划管理财务，避免大额支出，保持理性消费。\n";
    } else {
      wealth +=
        "本年财运以稳定为主，按劳取酬为宜，重在打基础、积累口碑，不宜进行高风险投机。\n";
    }
  }

  // 桃花 / 婚姻运（以子、午、卯、酉为常见桃花地支）
  const peachBranches = ["子", "午", "卯", "酉"];
  let love = `【桃花 / 婚姻运】\n`;
  if (peachBranches.includes(flowBranch)) {
    if (periodType === "日") {
      if (gender === "female") {
        love +=
          "今日带桃花，人缘较好，适合社交活动，单身者易遇谈得来的异性；有伴者需注意沟通。\n";
      } else {
        love +=
          "今日感情气场较活跃，适合参与聚会、社交活动，容易结识新朋友，但需真诚对待。\n";
      }
    } else {
      if (gender === "female") {
        love +=
          "流年带桃花，人缘与魅力上升，单身者宜多走动，易遇谈得来的异性；有伴者需把握分寸，重视沟通与信任。\n";
      } else {
        love +=
          "今年感情气场较活跃，适合多参与聚会、社交活动，容易结识有缘之人，但需真诚对待，切忌脚踩两船。\n";
      }
    }
  } else {
    if (periodType === "日") {
      love +=
        "今日感情运势平稳，适合经营现有关系，或专注于个人成长，内心平静更易吸引良缘。\n";
    } else {
      love +=
        "本年感情以平稳为主，更适合经营现有关系或调整自我状态，内心成熟后缘分自会水到渠成。\n";
    }
  }

  // 综合建议
  let summary = `【综合建议】\n`;
  const periodText = periodType === "日" ? "今日" : periodType === "年" ? `${targetYear}年` : "明年";
  summary += `命局日主为「${dayStem}」${dayElement}，${periodText}为「${flowStem}${flowBranch}」之气。整体来看，${periodType === "日" ? "今日" : "本年"}宜顺势而为，`;
  if (relStem.includes("官")) {
    summary += "在事业与责任上更主动承担，";
  } else if (relStem.includes("财")) {
    summary += "在财务与资源上多做规划与整合，";
  } else if (relStem.includes("印")) {
    summary += "在学习与修养上适当投入精力，";
  } else {
    summary += "保持平常心，稳中求进，";
  }
  if (periodType === "日") {
    summary +=
      "凡事多思考、多谨慎，脚踏实地完成每项任务，往往能在细节中积累出不错的收获。";
  } else {
    summary +=
      "凡事多听劝、多自省，脚踏实地，往往能在不知不觉间积累出不错的收获。";
  }

  return {
    career,
    wealth,
    love,
    summary,
    targetYear,
    flowStem,
    flowBranch,
  };
}

// --- 事件绑定与页面逻辑 ---
const form = document.getElementById("baziForm");
const errorEl = document.getElementById("error");
const resultCard = document.getElementById("resultCard");
const basicInfoEl = document.getElementById("basicInfo");
const baziLineEl = document.getElementById("baziLine");
const baziDetailEl = document.getElementById("baziDetail");
const yearTagEl = document.getElementById("yearTag");
const careerFortuneEl = document.getElementById("careerFortune");
const wealthFortuneEl = document.getElementById("wealthFortune");
const loveFortuneEl = document.getElementById("loveFortune");
const summaryFortuneEl = document.getElementById("summaryFortune");

// 明年运势元素
const nextYearTagEl = document.getElementById("nextYearTag");
const nextYearCareerFortuneEl = document.getElementById("nextYearCareerFortune");
const nextYearWealthFortuneEl = document.getElementById("nextYearWealthFortune");
const nextYearLoveFortuneEl = document.getElementById("nextYearLoveFortune");
const nextYearSummaryFortuneEl = document.getElementById("nextYearSummaryFortune");

// 今日运势元素
const todayTagEl = document.getElementById("todayTag");
const todayCareerFortuneEl = document.getElementById("todayCareerFortune");
const todayWealthFortuneEl = document.getElementById("todayWealthFortune");
const todayLoveFortuneEl = document.getElementById("todayLoveFortune");
const todaySummaryFortuneEl = document.getElementById("todaySummaryFortune");

// 指定年份运势元素
const queryYearFortuneSection = document.getElementById("queryYearFortuneSection");
const queryYearTagEl = document.getElementById("queryYearTag");
const queryYearCareerFortuneEl = document.getElementById("queryYearCareerFortune");
const queryYearWealthFortuneEl = document.getElementById("queryYearWealthFortune");
const queryYearLoveFortuneEl = document.getElementById("queryYearLoveFortune");
const queryYearSummaryFortuneEl = document.getElementById("queryYearSummaryFortune");

document.getElementById("resetBtn").addEventListener("click", () => {
  form.reset();
  errorEl.textContent = "";
  resultCard.style.display = "none";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const name = document.getElementById("name").value.trim() || "某人";
  const gender =
    (form.elements["gender"].value === "female" ? "female" : "male");
  const genderText = gender === "male" ? "男" : "女";
  const year = parseInt(document.getElementById("year").value, 10);
  const month = parseInt(document.getElementById("month").value, 10);
  const day = parseInt(document.getElementById("day").value, 10);
  const hourValue = document.getElementById("hour").value;
  const hour = hourValue === "" ? 0 : parseInt(hourValue, 10);
  const minuteValue = document.getElementById("minute").value;
  const minute = minuteValue === "" ? 0 : parseInt(minuteValue, 10);
  const place =
    document.getElementById("place").value.trim() || "（未填写出生地）";

  if (
    !year ||
    !month ||
    !day ||
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    errorEl.textContent =
      "请完整、正确填写出生年月日（年份需在 1900~2100 之间）。";
    resultCard.style.display = "none";
    return;
  }
  if (!isValidDate(year, month, day)) {
    errorEl.textContent = "日期不合法，请确认当月天数是否填写正确。";
    resultCard.style.display = "none";
    return;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    errorEl.textContent = "请填写正确的出生时间（时 0~23，分 0~59）。";
    resultCard.style.display = "none";
    return;
  }

  const bazi = calculateBazi(year, month, day, hour, minute);

  // 基本信息回显
  basicInfoEl.textContent = `${name}，${genderText}，出生于公历 ${year} 年 ${month} 月 ${day} 日 ${hour} 时 ${minute} 分，出生地：${place}。`;

  // 八字显示
  const yearStr = `${bazi.year.stem}${bazi.year.branch}`;
  const monthStr = `${bazi.month.stem}${bazi.month.branch}`;
  const dayStr = `${bazi.day.stem}${bazi.day.branch}`;
  const hourStr = `${bazi.hour.stem}${bazi.hour.branch}`;
  baziLineEl.textContent = `年柱：${yearStr}    月柱：${monthStr}    日柱：${dayStr}    时柱：${hourStr}`;

  const detail = [
    `年柱 ${yearStr}（${fiveElementsMap[bazi.year.stem]}${branchToElement[bazi.year.branch]}）`,
    `月柱 ${monthStr}（${fiveElementsMap[bazi.month.stem]}${branchToElement[bazi.month.branch]}）`,
    `日柱 ${dayStr}（${fiveElementsMap[bazi.day.stem]}${branchToElement[bazi.day.branch]}）`,
    `时柱 ${hourStr}（${fiveElementsMap[bazi.hour.stem]}${branchToElement[bazi.hour.branch]}）`,
  ].join(" / ");
  baziDetailEl.textContent = detail;

  // 本年运势分析
  const { year: currentYear, pillar: currentYearPillar } = getCurrentYearPillar();
  const fortune = analyzeFortune(bazi, gender, currentYearPillar, currentYear, "年");

  yearTagEl.textContent = `${fortune.targetYear} 年 ${fortune.flowStem}${fortune.flowBranch} 流年`;
  careerFortuneEl.textContent = fortune.career;
  wealthFortuneEl.textContent = fortune.wealth;
  loveFortuneEl.textContent = fortune.love;
  summaryFortuneEl.textContent = fortune.summary;

  // 明年运势分析
  const { year: nextYear, pillar: nextYearPillar } = getNextYearPillar();
  const nextYearFortune = analyzeFortune(bazi, gender, nextYearPillar, nextYear, "年");

  nextYearTagEl.textContent = `${nextYearFortune.targetYear} 年 ${nextYearFortune.flowStem}${nextYearFortune.flowBranch} 流年`;
  nextYearCareerFortuneEl.textContent = nextYearFortune.career;
  nextYearWealthFortuneEl.textContent = nextYearFortune.wealth;
  nextYearLoveFortuneEl.textContent = nextYearFortune.love;
  nextYearSummaryFortuneEl.textContent = nextYearFortune.summary;

  // 今日运势分析
  const todayPillar = getTodayPillar();
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const todayFortune = analyzeFortune(bazi, gender, todayPillar, todayYear, "日");

  todayTagEl.textContent = `${todayYear}年${todayMonth}月${todayDay}日 ${todayFortune.flowStem}${todayFortune.flowBranch} 日`;
  todayCareerFortuneEl.textContent = todayFortune.career;
  todayWealthFortuneEl.textContent = todayFortune.wealth;
  todayLoveFortuneEl.textContent = todayFortune.love;
  todaySummaryFortuneEl.textContent = todayFortune.summary;

  // 指定年份运势分析（如果填写了查询年份）
  const queryYearValue = document.getElementById("queryYear").value.trim();
  if (queryYearValue) {
    const queryYear = parseInt(queryYearValue, 10);
    if (queryYear >= 1900 && queryYear <= 2100) {
      const queryYearPillar = getYearPillar(queryYear);
      const queryYearFortune = analyzeFortune(bazi, gender, queryYearPillar, queryYear, "年");

      queryYearTagEl.textContent = `${queryYear} 年 ${queryYearFortune.flowStem}${queryYearFortune.flowBranch} 流年`;
      queryYearCareerFortuneEl.textContent = queryYearFortune.career;
      queryYearWealthFortuneEl.textContent = queryYearFortune.wealth;
      queryYearLoveFortuneEl.textContent = queryYearFortune.love;
      queryYearSummaryFortuneEl.textContent = queryYearFortune.summary;

      queryYearFortuneSection.style.display = "block";
    } else {
      queryYearFortuneSection.style.display = "none";
    }
  } else {
    queryYearFortuneSection.style.display = "none";
  }

  resultCard.style.display = "block";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

