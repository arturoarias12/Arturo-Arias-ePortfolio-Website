/* eslint-disable */
/**
 * Projects dataset — Arturo Arias
 *
 * slug → detail page at projects/{slug}.html
 * category: "BI Dashboard" | "Data Science" | "Web App" | "Analytics Eng." | "Research"
 * thumb: 1..11 (gradient index) or an image path
 */
const PROJECTS = [
  {
    title: "This website",
    slug: "this-portfolio",
    summary: "Personal ePortfolio built as a static site for GitHub Pages, featuring dark mode, responsive design, a contact form backend via Google Apps Script, and sections covering experience, skills, projects, and writing.",
    year: 2026, date: "2026",
    category: "Website",
    tags: ["HTML", "CSS", "JavaScript", "Google Apps Script", "GitHub Pages", "Responsive Design", "Dark Mode"],
    featured: true,
    thumb: "assets/img/projects/this-website.png",
    detail: "projects/this-portfolio.html",
    links: [
      { label: "GitHub", url: "https://github.com/arturoarias12", kind: "github" }
    ]
  },
  {
    title: "Real-Time Crypto Volatility Detection",
    slug: "crypto-volatility",
    summary: "End-to-end ML pipeline ingesting live Coinbase market data through Kafka, engineering 60-second volatility features, training XGBoost classifiers tracked with MLflow, and serving predictions via FastAPI with Prometheus and Grafana observability.",
    year: 2026, date: "2026",
    category: "Data Science",
    tags: ["Python", "Kafka", "XGBoost", "FastAPI", "MLflow", "Docker", "Prometheus", "Grafana", "Evidently", "Scikit-learn", "Machine Learning", "MLOps", "Data Engineering", "Streaming"],
    featured: true,
    thumb: "assets/img/projects/crypto-volatility.png",
    detail: "projects/crypto-volatility.html",
    links: [
      { label: "GitHub", url: "https://github.com/arturoarias12/Detecting-Crypto-Volatility-in-Real-time-FoOAI-", kind: "github" }
    ]
  },
  {
    title: "Auna / Oncosalud Web Analytics",
    slug: "auna-web-analytics",
    summary: "Automated reporting pipeline for a large healthcare provider's e-commerce and digital channels. Replaced manual workflows with Python-driven data flows connected to AWS Athena and GA4, surfaced through Power BI dashboards.",
    year: 2025, date: "2025",
    category: "BI Dashboard",
    tags: ["Python", "Power BI", "Amazon Athena", "Google Analytics", "ETL and ELT", "Data Visualization", "Hotjar", "Microsoft Clarity", "AB Tasty", "Data Engineering", "Healthcare"],
    featured: true,
    thumb: "assets/img/projects/auna-web-analytics.png",
    detail: "projects/auna-web-analytics.html",
    links: []
  },
  {
    title: "Power Substation Segmentation and New Substation Build Recommendations",
    slug: "substation-segmentation",
    summary: "Two-phase AI pipeline for US power grid planning: a U-Net segmentation model trained on 0.6m NAIP aerial imagery to detect existing substations, followed by a MILP optimizer producing 50 academic site recommendations for Maricopa County (proof-of-concept only, not real infrastructure decisions), reducing mean service distance by 80% in the Central Phoenix pilot.",
    year: 2026, date: "2026",
    category: "Data Science",
    tags: ["Python", "PyTorch", "U-Net", "CNN", "Computer Vision", "MILP", "Optimization", "Geospatial", "OpenStreetMap", "NAIP", "GeoPandas", "PuLP", "Machine Learning", "Infrastructure"],
    featured: true,
    thumb: "assets/img/projects/substation-segmentation.png",
    detail: "projects/substation-segmentation.html",
    links: []
  },
  {
    title: "Power Outage Forecasting and Emergency Generator Allocation",
    slug: "power-outage-forecasting",
    summary: "Machine learning framework for forecasting county-level Michigan power outages over 24- and 48-hour horizons, comparing SARIMA/SARIMAX, LSTM, and zero-inflated models, then allocating five emergency generators using cumulative outage burden.",
    year: 2026, date: "2026",
    category: "Data Science",
    tags: ["Python", "Machine Learning", "Time Series", "ARIMA Models (AR, MA, ARIMA)", "LSTM", "Recurrent Neural Networks", "Model Evaluation", "Pandas", "NumPy", "scikit-learn"],
    featured: true,
    thumb: "assets/img/projects/power-outage-forecasting.png",
    detail: "projects/power-outage-forecasting.html",
    links: []
  },
  {
    title: "Chess Rating Time Series Forecasting",
    slug: "chess-rating-forecasting",
    summary: "Statistical analysis and ARIMA forecasting of personal chess rating history. Applies decomposition, stationarity testing, and automated model selection to identify trend and noise components in competitive performance data.",
    year: 2024, date: "2024",
    category: "Data Science",
    tags: ["Python", "ARIMA Models (AR, MA, ARIMA)", "Statsmodels", "pmdarima", "Time Series", "Pandas", "NumPy", "Matplotlib", "Forecasting"],
    featured: false,
    thumb: "assets/img/projects/chess-rating-forecasting.png",
    detail: "projects/chess-rating-forecasting.html",
    links: [
      { label: "GitHub", url: "https://github.com/arturoarias12/time-series-analysis-lichess-blitz", kind: "github" }
    ]
  },
  {
    title: "Digital Nomad City Recommender",
    slug: "digital-nomad-recommender",
    summary: "Desktop application that scrapes visa, cost-of-living, and internet speed data across cities, then ranks destinations for digital nomads using a configurable composite score with interactive maps and comparison dashboards.",
    year: 2025, date: "2025",
    category: "Python App",
    tags: ["Python", "Pandas", "Tkinter", "BeautifulSoup", "Web Scraping", "NumPy", "Matplotlib", "Data Processing", "Data Visualization"],
    featured: false,
    thumb: "assets/img/projects/digital-nomad-recommender.png",
    detail: "projects/digital-nomad-recommender.html",
    links: [
      { label: "GitHub", url: "https://github.com/arturoarias12/Digital-Nomad-Recommendation-System", kind: "github" }
    ]
  },
  {
    title: "Student Attendance Management System",
    slug: "student-attendance-sql",
    summary: "Relational database system for educational institutions covering student attendance, teacher assignments, and class scheduling. Includes conceptual, logical, and physical design documentation alongside full T-SQL scripts.",
    year: 2024, date: "2024",
    category: "Analytics Eng.",
    tags: ["SQL", "SQL*Plus", "Relational Databases", "Entity-Relationship Modeling (ER)", "Data Modeling", "Normalization", "Jupyter Notebook", "T-SQL"],
    featured: false,
    thumb: "assets/img/projects/student-attendance-sql.png",
    detail: "projects/student-attendance-sql.html",
    links: [
      { label: "GitHub", url: "https://github.com/arturoarias12/StudentAttendanceManagement_SQL", kind: "github" }
    ]
  },
  {
    title: "Peru National Football Dataset",
    slug: "peru-football-dataset",
    summary: "Curated dataset of Peru's national football team results from 1927 to 2024, covering match details, venues, tournaments, elevation data, and coaching records, structured for statistical analysis and historical research.",
    year: 2024, date: "2024",
    category: "Research",
    tags: ["Python", "Pandas", "Jupyter Notebook", "Data Processing", "Data Curation", "Descriptive Statistics", "Sports Analytics"],
    featured: false,
    thumb: "assets/img/projects/peru-football-dataset.png",
    detail: "projects/peru-football-dataset.html",
    links: [
      { label: "GitHub", url: "https://github.com/arturoarias12/PeruFootballResults", kind: "github" },
      { label: "Kaggle", url: "https://www.kaggle.com/datasets/arturoarias12/peruvian-national-football-team-results", kind: "live" }
    ]
  },
  {
    title: "ChemE Jeopardy Platform",
    slug: "cheme-jeopardy",
    summary: "Networked Jeopardy platform for chemical engineering classrooms. Separate interfaces for moderator, players, and display screens, with real-time buzzer arbitration, JSON-defined question packs, and Docker deployment support.",
    year: 2026, date: "2026",
    category: "Web App",
    tags: ["Java", "JavaScript", "HTML", "CSS", "Docker", "Object-Oriented Programming", "API Development", "Multithreading", "Chemical Engineering", "Real-time"],
    featured: false,
    thumb: "assets/img/projects/cheme-jeopardy.png",
    detail: "projects/cheme-jeopardy.html",
    links: [
      { label: "GitHub", url: "https://github.com/arturoarias12/ChemE-Jeopardy", kind: "github" }
    ]
  },
  {
    title: "EDA of International Football Results (1872–2024)",
    slug: "football-results-eda",
    summary: "Solo exploratory data analysis of 47,399 international football match records spanning 152 years, answering 10 analytical questions on team performance, hosting advantages, goal-scoring patterns, and regional rivalries using Pandas and Seaborn, published as a Kaggle notebook.",
    year: 2024, date: "2024",
    category: "Research",
    tags: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "EDA", "Data Analysis", "Sports Analytics", "Football", "Kaggle", "Jupyter Notebook"],
    featured: false,
    thumb: "assets/img/projects/football-results-eda.png",
    detail: "projects/football-results-eda.html",
    links: [
      { label: "Kaggle", url: "https://www.kaggle.com/code/arturoarias12/eda-of-intl-football-results-from-1872-to-2024", kind: "live" }
    ]
  },
  {
    title: "Huambra Café Analytics Dashboard",
    slug: "huambra-cafe",
    summary: "End-to-end BI solution for a coffee shop startup in Pucallpa, Peru (Amazon region), migrating their operational database to Google BigQuery via Cloud Run, then delivering a fully custom Power BI dashboard published to Microsoft Fabric for live, auto-updating strategic insight.",
    year: 2026, date: "2026",
    category: "BI Dashboard",
    tags: ["Power BI", "DAX", "BigQuery", "Google Cloud", "Cloud Run", "Python", "Microsoft Fabric", "Data Modeling", "Data Visualization", "Business Analytics"],
    featured: false,
    thumb: "assets/img/projects/huambra-cafe.png",
    detail: "projects/huambra-cafe.html",
    links: []
  },
];

window.PROJECTS = PROJECTS;
