import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AddProject() {
    const navigate = useNavigate();
    const location=useLocation();

    // User state from SPOC dashboard
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Form state
    const [segment, setSegment] = useState("Select");
    const [classSem, setClassSem] = useState("");
    const [board, setBoard] = useState("");
    const [subject, setSubject] = useState("");
    const [series, setSeries] = useState("");
    const [medium, setMedium] = useState("(Eng)");
    const [session, setSession] = useState("25-26");
    const [startDate, setStartDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [msg, setMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [requests, setRequests] = useState([]);

    // API base URL - Updated to match your backend route structure
    // const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const API_BASE_URL = 'http://localhost:5000/api';

    // Authentication logic from SPOC dashboard
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            // Simulate user for demo
            const mockUser = {
                name: "Demo User",
                email: "demo@example.com",
                role: "SPOC",
                picture: "https://ui-avatars.com/api/?name=Demo+User&background=random&color=fff"
            };
            setUser(mockUser);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const u = {
                name: decoded.name,
                email: decoded.email,
                role: decoded.role,
                picture: decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random&color=fff`,
            };
            setUser(u);
        } catch (e) {
            console.error("Invalid token:", e);
            localStorage.removeItem("authToken");
            navigate("/");
        }
    }, [navigate]);

    // Fetch projects from backend - Updated URL to match your route structure
    const fetchProjects = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/spoc/projects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                setRequests(result.data);
            } else {
                console.error('Error fetching projects:', result.message);
                setMsg(`Error fetching projects: ${result.message}`);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setMsg('Error connecting to server. Please try again.');
        }
    };

    // Load projects on component mount
    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        navigate("/");
    };

    // Subject mappings with full names
    const VK_SUBJECTS = {
        "Acc": "Accountancy",
        "Acc-B": "Accountancy (Analysis of Financial Statements) (part B)",
        "Acc-A": "Accountancy (part A)",
        "EngAlt": "Alternative English",
        "AppMath": "Applied Maths",
        "AI": "Artificial Intelligence",
        "Bio": "Biology",
        "Bot": "Botany",
        "BST": "Business Studies",
        "BSTMgmt": "Business Studies and Management",
        "Chem": "Chemistry",
        "CA": "Computer Applications",
        "Eco": "Economics",
        "ElemMicMacEco": "Elementary Microeconomics and Macroeconomics",
        "EngCore": "English (Core) Lexicon",
        "EngCoreWB": "English (Core) Workbook",
        "EngLL": "English Language & Literature Lexicon",
        "EngLLWB": "English Language & Literature Lexicon Exercise Workbook",
        "EngCom": "English Literature Lexicon Communicative",
        "EngComWB": "English Literature Lexicon Communicative Exercise Workbook",
        "Ent": "Entrepreneurship",
        "Geo": "Geography",
        "HinCore": "Hindi (Core)",
        "HinA": "Hindi A",
        "HinB": "Hindi B",
        "Hist": "History",
        "IndHist": "Indian History",
        "WorHist": "World History",
        "HistGeo": "History&Geography",
        "IndEcoDev": "Indian Economic Development",
        "IndEcoDevPunEco": "Indian Economic Development with Punjab Economy",
        "IndEcoStat": "Indian Economy and Statistics",
        "IT": "Information Technology",
        "IntroMacEco": "Introductory Macroeconomics",
        "IntroMacEcoIndEcoDev": "Introductory Macroeconomics and India Economic development",
        "IntroMicEco": "Introductory Microeconomics",
        "IntroMicMacEco": "Introductory Microeconomics and Macroeconomics",
        "IntroMicStatEco": "Introductory microeconomics and Statistics for Economics",
        "Math": "Mathematics",
        "Phys": "Physics",
        "PolSci": "Political Science",
        "Psy": "Psychology",
        "Sans": "Sanskrit",
        "SansCom": "Sanskrit Sampreshnatma (Communicative)",
        "Sci": "Science",
        "SST": "Social Science",
        "Socio": "Sociology",
        "StatEco": "Statistics for Economics",
        "StatEcoIndEcoDev": "Statistics for Economics and Indian economic development",
        "HinVyakB": "Hindi Vyakaran Bodh (Course B)",
        "HinVyakA": "Hindi Vyakaran Prabudh (Course A)",
        "Zoo": "Zoology"
    };

    // Series mappings with full names
    const VK_SERIES = {
        "ANayak": "Abhinash Nayak",
        "AKJain": "A K Jain",
        "AKVerma": "Avnindra Kumar Verma",
        "AKKhillar": "A K Khillar",
        "DCP": "D C Pandey",
        "DS": "Divya Sharma",
        "TB": "Textbook",
        "Lab": "Lab Manual",
        "MapWB": "Map Workbook(H&G)",
        "PG": "Poonam Gandhi",
        "PRay": "Prabhakar Ray",
        "RK": "R K Singla",
        "RRai": "Raghunath Rai",
        "Sodhi": "Rajiv Sodhi/Poonam Sodhi",
        "RuchiY": "Ruchi Yadav",
        "SPrakash": "Satya Prakash",
        "SI": "Sharp Insights",
        "SM": "Smart Minds",
        "SSaini": "Sunita Saini",
        "SG": "Swati Gambhir",
        "TRJain": "T R Jain",
        "Ohri": "V K Ohri",
        "YS": "Yashpal Singh",
        "GNRastogi": "G N Rastogi",
        "RBansal": "Dr Rubal Bansal",
        "VSaluja": "Vibhab Saluja",
        "AKAgarwal": "Ashish Kr. Agrawal",
        "HKukreti": "Hemanth Kukreti",
        "SNayak": "Saresh Nayak",
        "AKS": "A K Srivastava",
        "SMittal": "Suravi Mittal",
        "BPatnayak": "Bipin Patnayak",
        "SKDas": "S K Das"
    };

    // UNI subjects mapping
    const UNI_SUBJECTS = {
        "AdvSalMgmt": "Advertising and Sales Management",
        "AssEv": "Assessment and Evalutation in Education",
        "Aud": "Auditing",
        "BankIns": "Banking and Insurance",
        "BankLawPrac": "Banking Law and Practices",
        "BankSysInd": "Banking System in India",
        "BITtools": "Basic IT Tools",
        "BasicStatEco": "Basic Statistics for Economics",
        "BasicEco": "Basics of Economics",
        "BusComm": "Business Communications",
        "BusEco": "Business Economics",
        "BusEnv": "Business Environment",
        "BusEthic": "Business Ethics",
        "BusLaw": "Business Law",
        "BusMgmt": "Business Management",
        "BusMathStat": "Business Mathematics and Statistics",
        "BusOrg": "Business Organisation",
        "BusOrgMgmt": "Business Organisation and Management",
        "BusStat": "Business Statistics",
        "BusStatMath": "Business Statistics and Mathematics",
        "Calc": "Calculus",
        "CODCalc": "Calculus and Ordinary Differential Calculus",
        "ComLaw": "Commercial Law",
        "CreatAdv": "Creativity and Advertising",
        "CommProfLife": "Communications in Professional Life",
        "CompLaw": "Company Law",
        "CABus": "Computer Applications in Business",
        "CAEco": "Computer Applications in Economics",
        "CompAccEfill": "Computerized Accounting & E-filling of Tax Returns",
        "ConsProt": "Consumer Protection in India",
        "CorpAcc": "Corporate Accounting",
        "CorpFin": "Corporate Finance",
        "CorpGov": "Corporate Governance",
        "CorpGovAud": "Corporate Governance and Auditing",
        "CorpLaw": "Corporate Law",
        "CorpTaxPlan": "Corporate Tax Planning",
        "CstAcc": "Cost Accounting",
        "CstMgmtAcc": "Cost and Management Accounting",
        "IssuesGlobalEco": "Current Issues in Global Economy",
        "CSAI": "Cyber Security and Artificial Intelligence",
        "DTSource": "Data Types and Sources",
        "Demog": "Demography",
        "DevEco": "Development Economics",
        "DisMgmt": "Disaster Management",
        "DiscMath": "Discrete Mathematics",
        "ECom": "E-Commerce",
        "EGov": "E-governance",
        "EcoEnvInd": "Economic Environment of India",
        "EcoHistInd": "Economic History of India",
        "EcoResRev": "Economic Research Review",
        "Eco": "Economics",
        "EcoAgr": "Economics of Agriculture",
        "EcoGroDev": "Economics of Growth & Development",
        "EcoRurDev": "Economics of Rural Development",
        "EcoHP": "Economy of Himachal Pradesh",
        "Edn": "Education",
        "EngLangComSkil": "English Language and Communication Skills",
        "EntDevStart": "Entrepreneurship Development and Start-up",
        "EVS": "Environmental Studies",
        "EVSDMgmt": "Environmental Studies & Disaster Management",
        "EventMgmt": "Event Management",
        "FinAcc": "Financial Accounting",
        "FinAnaRep": "Financial Analysis and Reporting",
        "FinInstMkt": "Financial Institutions & Markets",
        "FinMktInst": "Financial Markets & Institutions",
        "FinLit": "Financial Literacy",
        "FinMgmt": "Financial Management",
        "FinMktIns": "Financial Markets & Institutions",
        "FinMktInsServ": "Financial Markets, Institutions & Services",
        "FSAR": "Financial Statement Analysis and Reporting",
        "FMBegin": "Financial Management for beginners",
        "FundHRMgmt": "Fundamentals Human Resource Management",
        "FundBank": "Fundamentals of Banking",
        "FundBusServ": "Fundamentals of Business Services",
        "FundEco": "Fundamentals of Economics",
        "FundFM": "Fundamentals of Financial Management",
        "FIndCapMkt": "Fundamentals of Indian Capital Market",
        "FundInv": "Fundamentals of Investment",
        "FundInvPlan": "Fundamentals of Investment and Planning",
        "FundMgmt": "Fundamentals of Management",
        "FMOB": "Fundamentals of Management & Organisational Behaviour",
        "FundMkt": "Fundamentals of Marketing",
        "GM": "General Management",
        "GloBusEnv": "Global Business Environment",
        "GST": "Goods and Services Tax (GST)",
        "HarEco": "Haryana Economy",
        "HistInd": "History Of India",
        "HRMgmt": "Human Resource Management",
        "HumValEth": "Human Values and Ethics",
        "IncTax": "Income Tax",
        "ITLawPrac": "Income Tax Law and Practice",
        "IndBankIns": "Indian Banking and Insurance System",
        "IndBusEnv": "Indian Business Environment",
        "IndPolInst": "Indian Politics Institution",
        "IndConst": "Indian Constitutions",
        "IndEco": "Indian Economy",
        "IndLabLaw": "Industrial & Labour Laws",
        "IntmdMicro": "Intermediate Microeconomics",
        "IntBus": "International Business",
        "IntEco": "International Economics",
        "IntMkt": "International Marketing",
        "IntTrdPS": "International Trade: Policies and Strategies",
        "IntroEco": "Introductory Economics",
        "InvPlanSk": "Investment Planning Skills",
        "InvStockMkt": "Investing in stock market",
        "IAPMgmt": "Investment Analysis & Portfolio Management",
        "InvestMgmt": "Investment Management",
        "LegAspBus": "Legal Aspects of Business",
        "MacEco": "Macroeconomics",
        "MgmtAcc": "Management Accounting",
        "MnglAcc": "Managerial Accounting",
        "MnglSkil": "Managerial Skills",
        "MktMgmt": "Marketing Management",
        "MMforEco": "Mathematical Methods for Economics",
        "MerchBank": "Merchant Banking",
        "MerchBankFinServ": "Merchant Banking and Financial services",
        "MicEco": "Microeconomics",
        "MontEco": "Monetary Economics",
        "MonBank": "Money and Banking",
        "MBFinMkt": "Money, Banking and Financial Markets",
        "OST": "Office and Spreadsheet Tools",
        "OB": "Organisational Behaviour",
        "Parisudh": "Parisudha Bhasa 'O' Likhana Dhara",
        "PsnFin": "Personal Finance",
        "PerSellSales": "Personal Selling and Salesmanship",
        "PerDevComm": "Personality Development and Communication Skills",
        "PhilFounEdn": "Philosophical Foundations of Education",
        "PrinEco": "Principles of Economics",
        "PrinMacEco": "Principles of Macroeconomics",
        "PrinMgmt": "Principles of Management",
        "PoM": "Principles of Marketing",
        "PrinMicEco": "Principles of Microeconomics",
        "PrinPolSci": "Principles of Political Science",
        "ProbIndEco": "Problems of Indian Economy",
        "ProdMgmt": "Production Management",
        "ProfEng": "Proficiency in English",
        "ProjPlanCtrl": "Project Planning & Control",
        "PsyFounEdn": "Psychological Foundation of Education",
        "PsyMang": "Psychology for Managers",
        "PubEco": "Public Economics",
        "PubFin": "Public Finance",
        "QTBus": "Quantative Techinque for Business",
        "QTM": "Quantitative Techniques for Management",
        "RseMdWst": "Rise of Modern West",
        "ResMeth": "Research Methodology",
        "SahSwa": "Sahitya Swarupa",
        "SocAnciWorld": "Social Formation & Cultural Pattern Of Ancient World",
        "StatMeth": "Statistical Methods",
        "StatsBusDec": "Statistics for Business Decisions",
        "SCM": "Supply Chain Management",
        "TulSah": "Tulanatmaka Sahitya",
        "PolTho": "Understanding Political Thoughts",
        "WPolTho": "Western Political Thoughts",
        "StatTechEco": "Statistical Techniques For Economics",
        "MacEcoIntEco": "Macroeconomics and International Economics",
        "IntroMicEco": "Introductory Microeconomics",
        "GSTIndTax": "GST and other Indirect Taxes (Custom)",
        "QMB": "Quantitative Methods for Business",
        "AdhSahSPK": "ADHUNIKA ODIA SAHITYARA ITIHASA: SABUJA, PRAGATIBADI O' SWADHINATA PARABARTI KALA",
        "PraMadKab": "PRACHINA O MADHYAYUGIYA ODIA KABITA",
        "AdhSahNabSat": "ADHUNIKA ODIA SAHITYARA ITIHAS NABJAGRANA YUGA O' SATYABADI DHARA",
        "KalBisSah": "KALA BISAYA O SAHITYA",
        "EcoIndiaPP": "Indian Economy Problem and Perpects",
        "IntConInd": "Intoduction to constituion of india",
        "IntRel": "Internatinal Relations",
        "ColNatInd": "Colonialism and Nationalism in India",
        "StatEco": "Statistics for Economics",
        "IndEcoDev": "Indian Economic Development",
        "FunPolSci": "Fundamental of Poltical Science",
        "MathePhys": "Mathematical Physics",
        "PrinEco": "Principles of Ecology"
    };

    // UNI series mapping
    const UNI_SERIES = {
        "BA": "Bachelor of Arts",
        "BA(H)": "Bachelor of Arts (Honours)",
        "BBA": "Bachelor of Business Administration",
        "BCom": "Bachelor of Commerce",
        "BCom(H)": "Bachelor of Commerce (Honours)",
        "BCA": "Bachelor of Computer Applications",
        "BSc": "Bachelor of Science",
        "MCom": "Master of Commerce",
        "MA": "Master of Arts",
        "MBA": "Master of Business Administration",
        "BSc(H)": "Bachelor of Science (Honours)"
    };

    // FK subjects mapping
    const FK_SUBJECTS = {
        "Art": "Art",
        "Atlas": "Atlas",
        "Asm": "Assamese",
        "Bio": "Biology",
        "Chem": "Chemistry",
        "Comp": "Computer",
        "Eng": "English",
        "EVS": "Environmental Studies",
        "French": "French",
        "Geo": "Geography",
        "Germ": "German",
        "GA": "General Awarness",
        "GK": "General Knowledge",
        "Hin": "Hindi",
        "Hist": "History",
        "HistCiv": "History & civics",
        "Malym": "Malayalam",
        "Marathi": "Marathi",
        "Math": "Mathematics",
        "MV": "Moral Values",
        "Odia": "Odia",
        "Phys": "Physics",
        "Russ": "Russian",
        "Sanskrit": "Sanskrit",
        "Sci": "Science",
        "Sem1": "Semester I",
        "Sem2": "Semester II",
        "SST": "Social Science",
        "Tamil": "Tamil",
        "Term1": "Term-I",
        "Term2": "Term-II",
        "Term3": "Term-III"
    };

    // FK series mapping
    const FK_SERIES = {
        "Angie": "Art with Angie",
        "ColourMe": "Colour Me",
        "LCreate": "Learn to Create",
        "LDC": "Learn, Draw & Colour",
        "Art&Cr(Hyd)": "Art & Craft",
        "SkillCArt": "Skills in Creative Art",
        "MapWB": "Map Workbook",
        "Mid": "Middle Atlas",
        "Prim": "Primary Atlas",
        "Snr": "Senior Atlas",
        "InnoBio": "ICSE Innovative Biology",
        "InnoChem": "ICSE Innovative Chemistry",
        "AI": "Artificial Intelligence",
        "CompFun": "Computer Fun",
        "FKComp": "Future Kids Computers",
        "Clouds": "On Clouds",
        "Elmo(cap)": "English with Elmo (Capital)",
        "Elmo(small)": "English with Elmo (Small)",
        "GGram": "Go Grammar",
        "KYGram": "Know Your Grammar",
        "Patsy": "Pattern with Patsy",
        "Pearls": "Pearls MCB",
        "Roxan": "Read with Roxan",
        "RPearls": "Real Pearls MCB",
        "Rhyme": "Rhyme 'n' Chime",
        "Ripples": "Ripples MCB",
        "Skill(oral)": "Skills in English (Oral)",
        "Skill(writ)": "Skills in English (Writing)",
        "SkillCap": "Skills in English (Writing) Capital",
        "SkillSmall": "Skills in English (Writing) Small",
        "Curs": "Start writing cursive",
        "EngGram": "The English Grammar",
        "ISpy(Hyd)": "ISpy(Hyd)",
        "Activity(Hyd)": "Activity (Hyd)",
        "Rhymes(Hyd)": "Rhymes (Hyd)",
        "Patterns(Hyd)": "Patterns (Hyd)",
        "CapAlph(Hyd)": "Capital Alphabets",
        "SmalAlph(Hyd)": "Small Alphabets",
        "FKEVS": "Future Kids EVS",
        "NewEVS": "New Environmental Studies",
        "WLand": "Wonder Land",
        "Harm": "Harmonie",
        "LKilou": "Lisou et Kilou",
        "MLFranc": "Mon Livre de Francais",
        "MLFrancWB": "Mon Livre de Francais Workbook",
        "Klappt": "Es Klappt!",
        "GA(Hyd)": "GA (Hyd)",
        "FKGK": "Future Kids Book of General Knowledge",
        "Gina": "GK with Gina",
        "ScholGK": "Scholars GK",
        "ExplGeo": "Explore Geography",
        "Gyanlok": "Gyanlok",
        "Gmani": "Gyanmani (vyakaran)",
        "Gyanoday": "Gyanoday",
        "Gshirsh": "Gyanshirsh",
        "Gmani(new)": "New Gyanmani (vyakaran)",
        "RgManch": "Rangmanch",
        "Shabd(oral)": "Shabd gyan (oral)",
        "Shabd(writ)": "Shabd gyan (writing)",
        "Tarane": "Tarane",
        "Umang(read)": "Umang Hindi (reader)",
        "Umang(vyak)": "Umang Hindi (vyakaran)",
        "Varn(oral)": "Varn gyan (oral)",
        "Varn(writ)": "Varn gyan (writing)",
        "Vasundhra": "Vasundhra",
        "HAlphaOral(Hyd)": "Hindi Alphabet Oral (Hyd)",
        "HAlphaWrit(Hyd)": "Hindi Alphabet Writing (Hyd)",
        "HStorybk": "Hindi Story Books",
        "ExplHistCiv": "Explore History & Civics",
        "BNMalym": "Bhasha Noopuram Malayalam",
        "Granjan": "Gyanranjan",
        "FKMath": "Future Kids Mathematics",
        "IntWS(Hyd)": "Interactive Worksheet (Hyd)",
        "MPower": "Math Power",
        "Maxi": "Math with Maxi",
        "NPerfect": "New Perfect Math",
        "NumSkil(Hyd)": "Numeracy Skills (Hyd)",
        "NMagic": "Number Magic",
        "SkillM": "Skills in Maths",
        "Panch": "Panchantantra Fables",
        "PrecVal": "Precious Values",
        "GoodLife": "Towards a Good Life",
        "VLife": "Values for Life",
        "Barmala": "Chhabila Odia Barmala",
        "Pilanka": "Pilanka Matrubhasa Sahitya O Byakaran",
        "InnoPhys": "ICSE Innovative Physics",
        "AlphChart": "Alphabet chart",
        "MySurr": "My Surroundings",
        "GdHab": "Good Habits",
        "RusCur": "Russian Cursive Book",
        "Atula": "Atula",
        "SanVykn": "Sanskrit Vyakaran",
        "FKSci": "Future Kids Science",
        "SureS": "Sure Science",
        "SciSimp": "Science Simplified",
        "WondSci": "Wonderful science",
        "FKPath": "Future Kids Pathfinders",
        "FKSST": "Future Kids Social Science",
        "NewApp": "New Approach",
        "MagPan(Hyd)": "The Magic pan (Hyd)",
        "LitAng(Hyd)": "The Little Angel (Hyd)",
        "OurColWor(Hyd)": "Our colourful world(Hyd)",
        "KiusRoom(Hyd)": "Kiu's room (Hyd)",
        "BigUni(Hyd)": "The Big Universe(Hyd)",
        "GadAdv(Hyd)": "The Gadget Adventure(Hyd)",
        "LittScie(Hyd)": "Little Scientists",
        "Pic1(Hyd)": "Picture1 (Hyd)",
        "Pic2(Hyd)": "Picture2 (Hyd)",
        "TreHunt(Hyd)": "Treasure Hunt(Hyd)",
        "TinaKiki(Hyd)": "Tina and Kiki(Hyd)",
        "MagMusBand(Hyd)": "The Magical Music Band (Hyderabad)",
        "AniBabMom(Hyd)": "Animal Babies & Their Mommies (Hyderabad)",
        "DiwithFam(Hyd)": "Diwali with Family (Hyderabad)",
        "VanVegGar": "vani and her vegetable garden",
        "Khol": "Khol",
        "BadTraFun(Hyd)": "Badal's Travel Fun (Hyderabad)",
        "Grmr": "Tamil Amudu (Grammar)",
        "Grmr(new)": "Tamil Kalanjiyam (Grammar New)",
        "TBTr1(S)": "Textbook (South)",
        "WB(S)": "Workbook (South)",
        "Bit": "Bit by Bit",
        "IntWS(Hyd)": "Interactive Worksheet (Hyd)",
        "TB": "Textbook",
        "WB": "Workbook",
        "WS": "Worksheet",
        "TecBuz(Hyd)": "Tech Buzz (Hyd)",
        "CallyCat(Hyd)": "Cally, the Caterpillar",
        "MisSneCl(Hyd)": "Miss Sneha's Classroom",
        "ColSea(Hyd)": "Colourful Seasons",
        "HenryKind(Hyd)": "Henry Learns to Be Kind",
        "PollyBday(Hyd)": "Polly's Birthday Party",
        "MMazeHu(Hyd)": "Monu's Maze Hunt",
        "TBTr2(S)": "Textbook (South)",
        "TBTr3(S)": "Textbook (South)",
        "Bru&Rose(Hyd)": "Bruno and the Rose Bush",
        "Achoo(Hyd)": "Achoo! Achoo!",
        "ComW11": "Computer Windows11"
    };

    const VK = {
        subjects: Object.keys(VK_SUBJECTS),
        series: Object.keys(VK_SERIES),
        boards: `ABSE,BSEB,CBSE,HBSE,HPBSE,ICSE,ISC,JKBOSE,JBSE,BSEM,NBSE,CHSE,PBSE,RankCom,TNSB,KBPE,MSB,MBSE`.split(","),
        classes: ["6th", "7th", "8th", "9th", "10th", "11th", "12th"],
    };

    const FK = {
        subjects: Object.keys(FK_SUBJECTS),
        series: Object.keys(FK_SERIES),
        boards: `ABSE,BSEB,CBSE,HBSE,HPBSE,ICSE,ISC,JKBSE,JBSE,MBSE,NBSE,CHSE,PBSE,RankCom,TNSB,KBPE,MSB`.split(","),
        classes: ["PrePrim", "Nursery", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    };

    const UNI = {
        subjects: Object.keys(UNI_SUBJECTS),
        series: Object.keys(UNI_SERIES),
        classes: `Sem1,Sem2,Sem3,Sem4,Sem5,Sem6,Sem7,Sem8,Year1,Year2,Year3,Year4`.split(","),
        boards: `CBLU,CDLU,CRSU,DU,GJU,GNDU,GU,HPU,KU,MDU,OdishaU,PU,PBI`.split(","),
    };

    const MEDIUM = ["(Eng)", "(Hin)"];
    const SESSION = ["25-26", "26-27"];

    const clean = (arr) =>
        Array.from(new Set(arr.map((s) => (s ?? "").toString().trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

    const DATA = useMemo(() => {
        switch (segment) {
            case "FK": return { subjects: clean(FK.subjects), series: clean(FK.series), boards: clean(FK.boards), classes: clean(FK.classes) };
            case "UNI": return { subjects: clean(UNI.subjects), series: clean(UNI.series), boards: clean(UNI.boards), classes: clean(UNI.classes) };
            default: return { subjects: clean(VK.subjects), series: clean(VK.series), boards: clean(VK.boards), classes: clean(VK.classes) };
        }
    }, [segment]);

    // Get the appropriate mappings based on segment
    const getSubjectMappings = () => {
        switch (segment) {
            case "FK": return FK_SUBJECTS;
            case "UNI": return UNI_SUBJECTS;
            default: return VK_SUBJECTS;
        }
    };

    const getSeriesMappings = () => {
        switch (segment) {
            case "FK": return FK_SERIES;
            case "UNI": return UNI_SERIES;
            default: return VK_SERIES;
        }
    };

    // Generate project name
    const generateProjectName = () => {
        if (!segment || !classSem || !board || !subject || !series || !medium || !session) {
            return "";
        }
        
        const subjectMappings = getSubjectMappings();
        const seriesMappings = getSeriesMappings();
        
        const fullSubject = subjectMappings[subject] || subject;
        const fullSeries = seriesMappings[series] || series;
        
        return `${segment} ${classSem} ${board} ${fullSubject} ${fullSeries} ${medium} ${session}`;
    };

    const onSegmentChange = (v) => {
        setSegment(v);
        setClassSem("");
        setBoard("");
        setSubject("");
        setSeries("");
    };

    const canSubmit = segment && classSem && board && subject && series && medium && session && dueDate;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        setIsLoading(true);
        setMsg(null);

        const projectId = [segment, classSem, board, subject, series, medium, session].join("_");
        const projectName = generateProjectName();
        
        const payload = { 
            project_id: projectId, 
            project_name: projectName, 
            due_date: dueDate 
        };

        try {
            // Updated to match your backend route structure
            const response = await fetch(`${API_BASE_URL}/spoc/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                setMsg(`Project request submitted successfully!\nProject ID: ${projectId}\nProject Name: ${projectName}`);
                
                // Refresh the projects list
                await fetchProjects();
                
                // Reset form
                setSegment("Select");
                setClassSem("");
                setBoard("");
                setSubject("");
                setSeries("");
                setMedium("(Eng)");
                setSession("25-26");
                setDueDate("");
            } else {
                setMsg(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error submitting project:', error);
            setMsg('Error connecting to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Fixed Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
                <div className="max-w-full mx-auto px-4 sm:px-6">
                    {/* Main navbar content */}
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - Logo/Title and Sidebar Toggle */}
                        <div className="flex items-center">
                            {/* Sidebar toggle button for mobile/tablet only */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="mr-4 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
                            >
                                <span className="sr-only">Toggle sidebar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <div className="flex-shrink-0">
                                <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                                    <span className="block sm:inline">SPOC Dashboard</span>
                                    <span className="hidden sm:inline"> - Add Project</span>
                                </h1>
                            </div>
                        </div>

                        {/* Desktop menu - visible on md+ screens */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-slate-600"
                                />
                                <div className="text-right">
                                    <div className="text-sm font-medium">{user.name}</div>
                                    <div className="text-xs text-slate-300">{user.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                <span className="sr-only">Open main menu</span>
                                {!mobileMenuOpen ? (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu - visible when open on small screens */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-slate-700">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {/* User info */}
                                <div className="flex items-center px-3 py-3 bg-slate-800 rounded-lg">
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full border-2 border-slate-600"
                                    />
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-white">{user.name}</div>
                                        <div className="text-xs text-slate-300">{user.email}</div>
                                    </div>
                                </div>

                                {/* Logout button */}
                                <div className="px-3">
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Layout Container */}
            <div className="pt-16 flex">
         {/* Mobile Sidebar Overlay and Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl overflow-y-auto">
              <SidebarLinks navigate={navigate} location={location} close={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Desktop Sidebar - Hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
          <SidebarLinks navigate={navigate} location={location} />
        </aside>

                {/* Main content with proper margin for sidebar */}
                <main className={`flex-1 transition-all duration-300 ease-in-out lg:ml-72 overflow-y-auto`}>
                    {/* Content */}
                    <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
                        {/* Add Project Form */}
                        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
                            <div className="flex items-start justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-800">Add New Project</h2>
                                <div className="text-right">
                                    <span className="text-xs text-red-600">* required fields</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Field label="Segment *">
                                    <Select
                                        value={segment}
                                        onChange={onSegmentChange}
                                        options={["VK", "FK", "UNI"]}
                                        labels={{ "VK": "VK", "FK": "FK", "UNI": "UNI" }}
                                        isInvalid={!segment}
                                    />
                                </Field>

                                <Field label="Class/Semester *">
                                    <SearchableDropdown
                                        value={classSem}
                                        onChange={setClassSem}
                                        options={DATA.classes}
                                        placeholder="Search class/semester..."
                                        isInvalid={!classSem}
                                    />
                                </Field>

                                <Field label="Board *">
                                    <SearchableDropdown
                                        value={board}
                                        onChange={setBoard}
                                        options={DATA.boards}
                                        placeholder="Search board..."
                                        isInvalid={!board}
                                    />
                                </Field>

                                <Field label="Subject *">
                                    <EnhancedSearchableDropdown
                                        value={subject}
                                        onChange={setSubject}
                                        options={DATA.subjects}
                                        mappings={getSubjectMappings()}
                                        placeholder="Search subject..."
                                        isInvalid={!subject}
                                    />
                                </Field>

                                <Field label="Series/Author *">
                                    <EnhancedSearchableDropdown
                                        value={series}
                                        onChange={setSeries}
                                        options={DATA.series}
                                        mappings={getSeriesMappings()}
                                        placeholder="Search series/author..."
                                        isInvalid={!series}
                                    />
                                </Field>

                                <Field label="Medium *">
                                    <Select
                                        value={medium}
                                        onChange={setMedium}
                                        options={MEDIUM}
                                        isInvalid={!medium}
                                    />
                                </Field>

                                <Field label="Session *">
                                    <Select
                                        value={session}
                                        onChange={setSession}
                                        options={SESSION}
                                        isInvalid={!session}
                                    />
                                </Field>

                                <Field label="Due Date *">
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className={`w-full h-12 rounded-2xl border ${!dueDate ? "border-red-500" : "border-slate-300"
                                            } px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    />
                                </Field>
                            </div>

                            {/* Generated Project ID and Name Preview */}
                            {segment && classSem && board && subject && series && medium && session && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                                    <h3 className="text-sm font-medium text-blue-900 mb-2">Generated Project Details:</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-xs font-medium text-blue-700">Project ID:</span>
                                            <p className="text-sm text-blue-800 font-mono bg-white px-3 py-2 rounded-lg border">
                                                {[segment, classSem, board, subject, series, medium, session].join("_")}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-blue-700">Project Name:</span>
                                            <p className="text-sm text-blue-800 bg-white px-3 py-2 rounded-lg border">
                                                {generateProjectName()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSegment("Select");
                                        setClassSem("");
                                        setBoard("");
                                        setSubject("");
                                        setSeries("");
                                        setMedium("(Eng)");
                                        setSession("25-26");
                                        setDueDate("");
                                        setMsg(null);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 rounded-2xl border-2 border-slate-300 hover:bg-slate-50 transition-colors"
                                >
                                    Clear Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={!canSubmit || isLoading}
                                    className={`w-full sm:w-auto px-6 py-2 rounded-2xl text-white transition-colors ${canSubmit && !isLoading
                                        ? "bg-indigo-700 hover:bg-indigo-800"
                                        : "bg-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    {isLoading ? "Submitting..." : "Submit Project Request"}
                                </button>
                            </div>
                        </form>

                        {/* Success/Error Message */}
                        {msg && <Feedback message={msg} />}

                        {/* Recent Requests Table */}
                        <section className="mt-8">
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
                                <div className="px-6 py-4 border-b border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-800">Recent Project Requests</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="bg-slate-100 text-slate-900">
                                            <tr>
                                                <th className="px-6 py-3 font-semibold">Project ID</th>
                                                <th className="px-6 py-3 font-semibold">Project Name</th>
                                                <th className="px-6 py-3 font-semibold">Start Date</th>
                                                <th className="px-6 py-3 font-semibold">Due Date</th>
                                                <th className="px-6 py-3 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                                        No project requests found
                                                    </td>
                                                </tr>
                                            ) : (
                                                requests.map((request, idx) => (
                                                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                        <td className="px-6 py-4 font-mono text-xs">{request.projectId}</td>
                                                        <td className="px-6 py-4 text-xs">{request.projectName}</td>
                                                        <td className="px-6 py-4">{new Date(request.startDate).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">{new Date(request.dueDate).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {request.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}

/* ---- Sub Components ---- */
function Field({ label, children }) {
    return (
        <label className="block">
            <span className="block mb-2 text-sm font-medium text-slate-800">{label}</span>
            {children}
        </label>
    );
}

function Select({ value, onChange, options = [], labels = {}, isInvalid }) {
    const labelFor = (o) =>
        labels && typeof labels === "object" && labels[o] ? labels[o] : o;
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-12 text-sm px-3 rounded-2xl border-2 ${isInvalid ? "border-red-500" : "border-slate-300"
                } focus:border-indigo-600 focus:outline-none`}
        >
            <option value="">— Select —</option>
            {options.map((o) => (
                <option key={o} value={o}>
                    {labelFor(o)}
                </option>
            ))}
        </select>
    );
}

function SidebarLinks({ navigate, location, close }) {
  const [openMissingEntry, setOpenMissingEntry] = useState(false);

  // Keep sections open if child page active
  useEffect(() => {
    if (location.pathname.includes("missing-entry")) {
      setOpenMissingEntry(true);
    }
  }, [location]);

  const handleNavigation = (path, isChildOfMissingEntry = false) => {
    navigate(path);
    
    // Only close the dropdown if navigating away from missing entry section
    if (!isChildOfMissingEntry && !path.includes("missing-entry")) {
      setOpenMissingEntry(false);
    }
    
    if (close) close();
  };

  const toggleMissingEntry = () => {
    setOpenMissingEntry(!openMissingEntry);
  };

  // Check if we're on home page and NOT on any missing entry page
  const isHomePage = location.pathname === "/spoc-dashboard";
  const isMissingEntryPage = location.pathname.includes("missing-entry");

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
      <nav className="flex flex-col space-y-2">
        {/* Home */}
        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${
            isHomePage && !isMissingEntryPage ? "bg-gray-700" : ""
          }`}
          onClick={() => handleNavigation("/spoc-dashboard")}
        >
          Home
        </button>

        {/* Approve Worklogs */}
        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${
            location.pathname.includes("approve-worklogs") ? "bg-gray-700" : ""
          }`}
          onClick={() => handleNavigation("/spoc/approve-worklogs")}
        >
          Approve Worklogs
        </button>

        {/* Missing Entry - COLLAPSIBLE SECTION */}
        <div>
          <button
            className={`w-full flex justify-between items-center hover:bg-gray-700 p-3 rounded-lg transition-colors ${
              isMissingEntryPage && !location.pathname.includes("missing-entry-request") && !location.pathname.includes("missing-entry-status")
                ? "bg-gray-700"
                : ""
            }`}
            onClick={toggleMissingEntry}
          >
            <span>Missing Entry</span>
            <span className="transition-transform duration-200">
              {openMissingEntry ? "▾" : "▸"}
            </span>
          </button>
          {openMissingEntry && (
            <div className="ml-4 mt-2 flex flex-col space-y-2 animate-fadeIn">
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                  location.pathname.includes("missing-entry-request") ? "bg-gray-700" : ""
                }`}
                onClick={() => handleNavigation("/spoc/missing-entry-request", true)}
              >
                Request Missing Entry
              </button>
              <button
                className={`text-left hover:bg-gray-700 p-2 rounded-lg transition-colors ${
                  location.pathname.includes("missing-entry-status") ? "bg-gray-700" : ""
                }`}
                onClick={() => handleNavigation("/spoc/missing-entry-status", true)}
              >
                Approve Missing Entry
              </button>
            </div>
          )}
        </div>

        {/* Add Project */}
        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${
            location.pathname.includes("/spoc/add-project") ? "bg-gray-700" : ""
          }`}
          onClick={() => handleNavigation("/spoc/add-project")}
        >
          Add Project
        </button>

         {/* Mark Extra Shift */}
        <button
          className={`text-left hover:bg-gray-700 p-3 rounded-lg transition-colors ${
            location.pathname.includes("mark-night-shift") || location.pathname.includes("mark-extra-shift")
              ? "bg-gray-700"
              : ""
          }`}
          onClick={() => handleNavigation("/spoc/mark-night-shift")}
        >
          Mark Extra Shift
        </button>
      </nav>
    </div>
  );
}

function SearchableDropdown({ value, onChange, options = [], placeholder, isInvalid }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Filter options based on query
    const filtered = useMemo(
        () =>
            options.filter((o) =>
                o.toLowerCase().includes(query.toLowerCase())
            ),
        [query, options]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.closest(".search-select-container")) return;
            setIsOpen(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="relative search-select-container">
            <input
                type="text"
                value={query || value || ""}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    if (!e.target.value) onChange("");
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={`w-full h-12 rounded-2xl border-2 ${isInvalid ? "border-red-500" : "border-slate-300"
                    } px-3 focus:border-indigo-600 focus:outline-none`}
            />
            {isOpen && (query || !value) && (
                <ul className="absolute z-20 bg-white border-2 border-slate-300 rounded-2xl mt-1 max-h-48 overflow-y-auto w-full shadow-lg">
                    {filtered.length > 0 ? (
                        filtered.map((o) => (
                            <li
                                key={o}
                                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                onClick={() => {
                                    onChange(o);
                                    setQuery("");
                                    setIsOpen(false);
                                }}
                            >
                                {o}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-3 text-slate-500">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
}

function EnhancedSearchableDropdown({ value, onChange, options = [], mappings = {}, placeholder, isInvalid }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Filter options based on query - search both abbreviation and full name
    const filtered = useMemo(() => {
        if (!query) return options;
        
        return options.filter((abbrev) => {
            const fullName = mappings[abbrev] || abbrev;
            return abbrev.toLowerCase().includes(query.toLowerCase()) || 
                   fullName.toLowerCase().includes(query.toLowerCase());
        });
    }, [query, options, mappings]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.closest(".enhanced-search-select-container")) return;
            setIsOpen(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="relative enhanced-search-select-container">
            <input
                type="text"
                value={query || value || ""}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    if (!e.target.value) onChange("");
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={`w-full h-12 rounded-2xl border-2 ${isInvalid ? "border-red-500" : "border-slate-300"
                    } px-3 focus:border-indigo-600 focus:outline-none`}
            />
            {isOpen && (query || !value) && (
                <ul className="absolute z-20 bg-white border-2 border-slate-300 rounded-2xl mt-1 max-h-48 overflow-y-auto w-full shadow-lg">
                    {filtered.length > 0 ? (
                        filtered.map((abbrev) => {
                            const fullName = mappings[abbrev] || abbrev;
                            return (
                                <li
                                    key={abbrev}
                                    className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                    onClick={() => {
                                        onChange(abbrev);
                                        setQuery("");
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-900">[{abbrev}]</span>
                                        <span className="text-xs text-slate-600">{fullName}</span>
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <li className="px-4 py-3 text-slate-500">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
}

function Feedback({ message }) {
    const isError = message && (message.includes("Error") || message.includes("Failed"));
    const isSuccess = message && (message.includes("submitted") || message.includes("✔"));

    let bgColor = "bg-blue-50 border-blue-200 text-blue-900";
    if (isError) bgColor = "bg-red-50 border-red-200 text-red-900";
    if (isSuccess) bgColor = "bg-emerald-50 border-emerald-200 text-emerald-900";

    return (
        <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-wrap ${bgColor}`}>
            {message}
        </div>
    );
}