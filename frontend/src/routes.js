
import Index from "views/Index.js";

// import Profile from "views/Admin/Profile.js";
import Login from "views/Auth/Login.js";
import CreatedTerms from "views/Admin/CreatedTerms";
import AcceptedTerms from "views/Admin/AcceptedTerms";
import RejectedTerms from "views/Admin/RejectedTerms";
import RevokedTerms from "views/Admin/RevokedTerms";
import PrivateTerms from "views/Admin/PrivateTerms";
import TokenSpendingTerms from "views/Admin/TokenSpendingTerms";
import EscrowTerms from "views/Admin/EscrowTerms";

// import Maps from "views/examples/Maps.js";
// import Register from "views/examples/Register.js";

// import Icons from "views/examples/Icons.js";

var routes = [
  {
    path: "/",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: Index,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: true
  },

  {
    path: "/private-terms",
    name: "Private Terms",
    icon: "ni ni-bullet-list-67 text-red",
    component: PrivateTerms,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: false
  },

  {
    path: "/tokenspending-terms",
    name: "Token Spending Terms",
    icon: "ni ni-bullet-list-67 text-red",
    component: TokenSpendingTerms,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: false
  },

  {
    path: "/escrow-terms",
    name: "Escrow Terms",
    icon: "ni ni-bullet-list-67 text-red",
    component: EscrowTerms,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: false
  },
  {
    path: "/created-terms",
    name: "Created Terms",
    icon: "ni ni-bullet-list-67 text-red",
    component: CreatedTerms,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: false
  },
  {
    path: "/accepted-terms",
    name: "Accepted Terms",
    icon: "ni ni-bullet-list-67 text-red",
    component: AcceptedTerms,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: false
  },
  {
    path: "/rejected-terms",
    name: "Rejected Terms",
    icon: "ni ni-bullet-list-67 text-red",
    component: RejectedTerms,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: false
  },
  {
    path: "/revoked-terms",
    name: "Revoked Terms",
    icon: "ni ni-bullet-list-67 text-red",
    component: RevokedTerms,
    layout: "/admin",
    isSidebarLink: true,
    indexRoute: false
  },

  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth",
    isSidebarLink: false,
    indexRoute: true
  },
  // {
  //   path: "/register",
  //   name: "Register",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: Register,
  //   layout: "/auth"
  // },

];
export default routes;
