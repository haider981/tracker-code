import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AddProject() {
    const navigate = useNavigate();

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
    const [dueDate, setDueDate] = useState("");
    const [msg, setMsg] = useState(null);

    const [requests, setRequests] = useState([
        { projectId: "VK_11th_CHSE_Bot_AKKhillar_(Eng)_25-26", dueDate: "2025-08-10", status: "Approved" },
        { projectId: "VK_11th_CHSE_Bot_TB_(Eng)_25-26", dueDate: "2025-07-15", status: "Rejected" },
        { projectId: "VK_11th_CHSE_Chem_SG_(Eng)_25-26", dueDate: "2025-09-01", status: "Approved" },
        { projectId: "VK_12th_CBSE_BST_XAM_(Eng)_25-26", dueDate: "2025-06-20", status: "Rejected" },
        { projectId: "VK_11th_CHSE_Phys_SPrakash_(Eng)_25-26", dueDate: "2025-10-05", status: "Approved" },
    ]);

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

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        navigate("/");
    };

    const VK = {
        subjects: `Acc,Acc-B,Acc-A,AppMath,AI,Bio,Bot,BST,BSTMgmt,Chem,CA,Eco,ElemMicMacEco,EngCore,EngCoreWB,EngLL,EngLLWB,EngCom,EngComWB,Ent,Geo,HinCore,HinA,HinB,Hist,IndHist,WorHist,HistGeo,IndEcoDev,IndEcoDevPunEco,IndEcoStat,IT,IntroMacEco,IntroMacEcoIndEcoDev,IntroMicEco,IntroMicMacEco,IntroMicStatEco,Math,Phys,PolSci,Psy,Sans,SansCom,Sci,SST,Socio,StatEco,StatEcoIndEcoDev,HinVyakB,HinVyakA,Zoo,Eco`.split(","),
        series: `ANayak,AKJain,AKVerma,AKKhillar,DCP,DS,TB,Lab,MapWB,PG,PRay,RK,RRai,Sodhi,RuchiY,SPrakash,SI,SM,SSaini,SG,TRJain,Ohri,YS,GNRastogi,RBansal,VSaluja,AKAgarwal,HKukreti,SNayak,AKS,SMittal,BPatnayak,SKDas`.split(","),
        boards: `ABSE,BSEB,CBSE,HBSE,HPBSE,ICSE,ISC,JKBOSE,JBSE,BSEM,NBSE,CHSE,PBSE,RankCom,TNSB,KBPE,MSB,MBSE`.split(","),
        classes: ["6th", "7th", "8th", "9th", "10th", "11th", "12th"],
    };

    const FK = {
        subjects: `Art,Atlas,Asm,Bio,Chem,Comp,Eng,EVS,French,Geo,Germ,GA,GK,Hin,Hist,HistCiv,Malym,Marathi,Math,MV,Odia,Phys,Russ,Sanskrit,Sci,Sem1,Sem2,SST,Tamil,Term1,Term2,Term3`.split(","),
        series: `Angie,ColourMe,LCreate,LDC,Art&Cr(Hyd),SkillCArt,MapWB,Mid,Prim,Snr,InnoBio,InnoChem,AI,CompFun,FKComp,Clouds,Elmo(cap),Elmo(small),GGram,KYGram,Patsy,Pearls,Roxan,RPearls,Rhyme,Ripples,Skill(oral),Skill(writ),SkillCap,SkillSmall,Curs,EngGram,ISpy(Hyd),Activity(Hyd),Rhymes(Hyd),Patterns(Hyd),CapAlph(Hyd),SmalAlph(Hyd),FKEVS,NewEVS,WLand,Harm,LKilou,MLFranc,MLFrancWB,Klappt,GA(Hyd),FKGK,Gina,ScholGK,ExplGeo,Gyanlok,Gmani,Gyanoday,Gshirsh,Gmani(new),RgManch,Shabd(oral),Shabd(writ),Tarane,Umang(read),Umang(vyak),Varn(oral),Varn(writ),Vasundhra,HAlphaOral(Hyd),HAlphaWrit(Hyd),HStorybk,ExplHistCiv,BNMalym,Granjan,FKMath,IntWS(Hyd),MPower,Maxi,NPerfect,NumSkil(Hyd),NMagic,SkillM,Panch,PrecVal,GoodLife,VLife,Barmala,Pilanka,InnoPhys,AlphChart,MySurr,GdHab,RusCur,Atula,SanVykn,FKSci,SciSimp,WondSci,FKPath,FKSST,NewApp,MagPan(Hyd),LitAng(Hyd),OurColWor(Hyd),KiusRoom(Hyd),BigUni(Hyd),GadAdv(Hyd),LittScie(Hyd),Pic1(Hyd),Pic2(Hyd),TreHunt(Hyd),TinaKiki(Hyd),MagMusBand(Hyd),AniBabMom(Hyd),DiwithFam(Hyd),VanVegGar,Khol,BadTraFun(Hyd),Grmr,Grmr(new),TBTr1(S),WB(S),Bit,IntWS(Hyd),TB,WB,WS,TecBuz(Hyd),CallyCat(Hyd),MisSneCl(Hyd),ColSea(Hyd),HenryKind(Hyd),PollyBday(Hyd),MMazeHu(Hyd),TBTr2(S),TBTr3(S),Bru&Rose(Hyd),Achoo(Hyd),ComW11`.split(","),
        boards: `ABSE,BSEB,CBSE,HBSE,HPBSE,ICSE,ISC,JKBSE,JBSE,MBSE,NBSE,CHSE,PBSE,RankCom,TNSB,KBPE,MSB`.split(","),
        classes: ["PrePrim", "Nursery", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    };

    const UNI = {
        subjects: `AdvSalMgmt,AssEv,Aud,BankIns,BankLawPrac,BankSysInd,BITtools,BasicStatEco,BasicEco,BusComm,BusEco,BusEnv,BusEthic,BusLaw,BusMgmt,BusMathStat,BusOrg,BusOrgMgmt,BusStat,BusStatMath,Calc,CODCalc,ComLaw,CreatAdv,CommProfLife,CompLaw,CABus,CAEco,CompAccEfill,ConsProt,CorpAcc,CorpFin,CorpGov,CorpGovAud,CorpLaw,CorpTaxPlan,CstAcc,CstMgmtAcc,IssuesGlobalEco,CSAI,DTSource,Demog,DevEco,DisMgmt,DiscMath,ECom,EGov,EcoEnvInd,EcoHistInd,EcoResRev,Eco,EcoAgr,EcoGroDev,EcoRurDev,EcoHP,Edn,EngLangComSkil,EntDevStart,EVS,EVSDMgmt,EventMgmt,FinAcc,FinAnaRep,FinInstMkt,FinMktInst,FinLit,FinMgmt,FinMktIns,FinMktInsServ,FSAR,FMBegin,FundHRMgmt,FundBank,FundBusServ,FundEco,FundFM,FIndCapMkt,FundInv,FundInvPlan,FundMgmt,FMOB,FundMkt,GM,GloBusEnv,GST,HarEco,HistInd,HRMgmt,HumValEth,IncTax,ITLawPrac,IndBankIns,IndBusEnv,IndPolInst,IndConst,IndEco,IndLabLaw,IntmdMicro,IntmdMicro,IntBus,IntEco,IntMkt,IntTrdPS,IntroEco,InvPlanSk,InvStockMkt,IAPMgmt,InvestMgmt,LegAspBus,MacEco,MgmtAcc,MnglAcc,MnglSkil,MktMgmt,MMforEco,MerchBank,MerchBankFinServ,MicEco,MontEco,MonBank,MBFinMkt,OST,OB,Parisudh,PsnFin,PerSellSales,PerDevComm,PhilFounEdn,PrinEco,PrinMacEco,PrinMgmt,PoM,PrinMicEco,PrinPolSci,ProbIndEco,ProdMgmt,ProfEng,ProjPlanCtrl,PsyFounEdn,PsyMang,PubEco,PubFin,QTBus,QTM,RseMdWst,ResMeth,SahSwa,SocAnciWorld,StatMeth,StatsBusDec,SCM,TulSah,PolTho,WPolTho,StatTechEco,MacEcoIntEco,IntroMicEco,GSTIndTax,QMB,AdhSahSPK,PraMadKab,AdhSahNabSat,KalBisSah,EcoIndiaPP,IntConInd,IntRel,ColNatInd,StatEco,IndEcoDev,FunPolSci,MathePhys,PrinEco`.split(","),
        series: `BA,BA(H),BBA,BCom,BCom(H),BCA,BSc,MCom,MA,MBA,BSc(H)`.split(","),
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

    const onSegmentChange = (v) => {
        setSegment(v);
        setClassSem("");
        setBoard("");
        setSubject("");
        setSeries("");
    };

    const canSubmit = segment && classSem && board && subject && series && medium && session && dueDate;

    const onSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        const payload = { segment, classSem, board, subject, series, medium, session, dueDate };
        setMsg(`Request submitted to admin ✔\n${JSON.stringify(payload, null, 2)}`);

        const projectId = [segment, classSem, board, subject, series, medium, session].join("_");
        setRequests((prev) => [{ projectId, dueDate, status: "In Review" }, ...prev]);

        setSegment("VK");
        setClassSem("");
        setBoard("");
        setSubject("");
        setSeries("");
        setMedium("(Eng)");
        setSession("25-26");
        setDueDate("");
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
                        {/* Backdrop */}
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
                        {/* Mobile Sidebar */}
                        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-white">Menu</h2>
                                    <button
                                        onClick={() => setSidebarOpen(false)}
                                        className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <nav className="flex flex-col space-y-4">
                                    <button
                                        className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                        onClick={() => {
                                            navigate("/spoc-dashboard")
                                            setSidebarOpen(false)
                                        }}
                                    >
                                        Home
                                    </button>
                                    
                                    <button
                                        className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                        onClick={() => {
                                            navigate("/spoc/approve-worklogs")
                                            setSidebarOpen(false)
                                        }}
                                    >
                                        Approve Worklogs
                                    </button>
                                    <button
                                        className="text-left hover:bg-gray-700 p-3 rounded-lg bg-gray-700 transition-colors duration-200 text-white w-full"
                                        onClick={() => {
                                            navigate("/spoc/add-project")
                                            setSidebarOpen(false)
                                        }}
                                    >
                                        Add Project
                                    </button>
                                    <button
                                        className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                        onClick={() => {
                                            navigate("/spoc/mark-night-shift")
                                            setSidebarOpen(false)
                                        }}
                                    >
                                        Mark Night Shift
                                    </button>
                                    {/* <button
                                        className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                        onClick={() => {
                                            navigate("/spoc/view-analysis")
                                            setSidebarOpen(false)
                                        }}
                                    >
                                        View Analysis
                                    </button> */}
                                </nav>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Desktop Sidebar - Hidden on mobile, visible on lg+ */}
                <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-gray-800 text-white shadow-xl overflow-y-auto">
                    <div className="p-6">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-white">Menu</h2>
                        </div>
                        <nav className="flex flex-col space-y-4">
                            <button
                                className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                onClick={() => {
                                    navigate("/spoc-dashboard")
                                    setSidebarOpen(false)
                                }}
                            >
                                Home
                            </button>
                            
                            <button
                                className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                onClick={() => {
                                    navigate("/spoc/approve-worklogs")
                                    setSidebarOpen(false)
                                }}
                            >
                                Approve Worklogs
                            </button>
                              <button
                                className="text-left hover:bg-gray-700 p-3 rounded-lg bg-gray-700 transition-colors duration-200 text-white w-full"
                                onClick={() => {
                                    navigate("/spoc/add-project")
                                    setSidebarOpen(false)
                                }}
                            >
                                Add Project
                            </button>
                            <button
                                className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                onClick={() => {
                                    navigate("/spoc/mark-night-shift")
                                    setSidebarOpen(false)
                                }}
                            >
                                Mark Night Shift
                            </button>
                            {/* <button
                                className="text-left hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200 text-white w-full"
                                onClick={() => {
                                    navigate("/spoc/view-analysis")
                                    setSidebarOpen(false)
                                }}
                            >
                                View Analysis
                            </button> */}
                        </nav>
                    </div>
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
                                    <SearchableDropdown
                                        value={subject}
                                        onChange={setSubject}
                                        options={DATA.subjects}
                                        placeholder="Search subject..."
                                        isInvalid={!subject}
                                    />
                                </Field>

                                <Field label="Series/Author *">
                                    <SearchableDropdown
                                        value={series}
                                        onChange={setSeries}
                                        options={DATA.series}
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

                            {/* Generated Project ID Preview */}
                            {segment && classSem && board && subject && series && medium && session && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                                    <h3 className="text-sm font-medium text-blue-900 mb-2">Generated Project ID:</h3>
                                    <p className="text-sm text-blue-800 font-mono bg-white px-3 py-2 rounded-lg border">
                                        {[segment, classSem, board, subject, series, medium, session].join("_")}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSegment("VK");
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
                                    disabled={!canSubmit}
                                    className={`w-full sm:w-auto px-6 py-2 rounded-2xl text-white transition-colors ${canSubmit
                                        ? "bg-indigo-700 hover:bg-indigo-800"
                                        : "bg-slate-400 cursor-not-allowed"
                                        }`}
                                >
                                    Submit Project Request
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
                                                <th className="px-6 py-3 font-semibold">Due Date</th>
                                                <th className="px-6 py-3 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((request, idx) => (
                                                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                    <td className="px-6 py-4 font-mono text-xs">{request.projectId}</td>
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
                                            ))}
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
                value={query || value || ""}  // show query while typing, otherwise selected value
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    if (!e.target.value) onChange(""); // reset selection when cleared
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
                                    onChange(o);   // set selected value
                                    setQuery("");  // clear query so value shows
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
