import ActionList from './pages/ActionList';
import Admin from './pages/Admin';
import Affiliate from './pages/Affiliate';
import ContentOrders from './pages/ContentOrders';
import Credits from './pages/Credits';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Layout from './pages/Layout';
import Models from './pages/Models';
import MyFiles from './pages/MyFiles';
import Onboarding from './pages/Onboarding';
import OrderHistory from './pages/OrderHistory';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';
import TemplateLibrary from './pages/TemplateLibrary';
import Terms from './pages/Terms';
import index from './pages/index';


export const PAGES = {
    "ActionList": ActionList,
    "Admin": Admin,
    "Affiliate": Affiliate,
    "ContentOrders": ContentOrders,
    "Credits": Credits,
    "Dashboard": Dashboard,
    "Home": Home,
    "Layout": Layout,
    "Models": Models,
    "MyFiles": MyFiles,
    "Onboarding": Onboarding,
    "OrderHistory": OrderHistory,
    "Privacy": Privacy,
    "Settings": Settings,
    "TemplateLibrary": TemplateLibrary,
    "Terms": Terms,
    "index": index,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
};