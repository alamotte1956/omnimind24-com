import Layout from "./Layout.jsx";

import ActionList from "./ActionList";

import Home from "./Home";

import Login from "./LoginEnhanced";

import Admin from "./Admin";

import Affiliate from "./Affiliate";

import ContentOrders from "./ContentOrders";

import Credits from "./Credits";

import Dashboard from "./Dashboard";

import Models from "./Models";

import MyFiles from "./MyFiles";

import Onboarding from "./Onboarding";

import OrderHistory from "./OrderHistory";

import Privacy from "./Privacy";

import Settings from "./Settings";

import TemplateLibrary from "./TemplateLibrary";

import Terms from "./Terms";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Login: Login,
    
    ActionList: ActionList,
    
    Admin: Admin,
    
    Affiliate: Affiliate,
    
    ContentOrders: ContentOrders,
    
    Credits: Credits,
    
    Dashboard: Dashboard,
    
    Models: Models,
    
    MyFiles: MyFiles,
    
    Onboarding: Onboarding,
    
    OrderHistory: OrderHistory,
    
    Privacy: Privacy,
    
    Settings: Settings,
    
    TemplateLibrary: TemplateLibrary,
    
    Terms: Terms,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // Pages that should not have the sidebar layout
    const noLayoutPages = ['/', '/Home', '/Login'];
    const shouldUseLayout = !noLayoutPages.includes(location.pathname);
    
    const routes = (
        <Routes>            
            
                <Route path="/" element={<Home />} />
            
            <Route path="/Home" element={<Home />} />
            
            <Route path="/Login" element={<Login />} />
            
            
            <Route path="/ActionList" element={<ActionList />} />
            
            <Route path="/Admin" element={<Admin />} />
            
            <Route path="/Affiliate" element={<Affiliate />} />
            
            <Route path="/ContentOrders" element={<ContentOrders />} />
            
            <Route path="/Credits" element={<Credits />} />
            
            <Route path="/Dashboard" element={<Dashboard />} />
            
            <Route path="/Models" element={<Models />} />
            
            <Route path="/MyFiles" element={<MyFiles />} />
            
            <Route path="/Onboarding" element={<Onboarding />} />
            
            <Route path="/OrderHistory" element={<OrderHistory />} />
            
            <Route path="/Privacy" element={<Privacy />} />
            
            <Route path="/Settings" element={<Settings />} />
            
            <Route path="/TemplateLibrary" element={<TemplateLibrary />} />
            
            <Route path="/Terms" element={<Terms />} />
            
        </Routes>
    );
    
    if (shouldUseLayout) {
        return (
            <Layout currentPageName={currentPage}>
                {routes}
            </Layout>
        );
    }
    
    return routes;
}

export default function Pages() {
    return (
        <Router basename="/omnimind24-com">
            <PagesContent />
        </Router>
    );
}