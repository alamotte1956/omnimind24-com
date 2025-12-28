import ActionList from './pages/ActionList';
import Admin from './pages/Admin';
import Affiliate from './pages/Affiliate';
import ContentOrders from './pages/ContentOrders';
import Credits from './pages/Credits';
import Dashboard from './pages/Dashboard';
import Models from './pages/Models';
import MyFiles from './pages/MyFiles';
import Onboarding from './pages/Onboarding';
import OrderHistory from './pages/OrderHistory';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';
import TemplateLibrary from './pages/TemplateLibrary';
import Terms from './pages/Terms';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActionList": ActionList,
    "Admin": Admin,
    "Affiliate": Affiliate,
    "ContentOrders": ContentOrders,
    "Credits": Credits,
    "Dashboard": Dashboard,
    "Models": Models,
    "MyFiles": MyFiles,
    "Onboarding": Onboarding,
    "OrderHistory": OrderHistory,
    "Privacy": Privacy,
    "Settings": Settings,
    "TemplateLibrary": TemplateLibrary,
    "Terms": Terms,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};