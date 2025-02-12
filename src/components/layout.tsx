import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import Footbar from "./footbar";

interface layoutProps {
  userinfo: any;
  children: any;
}

const Layout: React.FC<layoutProps> = ({ children, userinfo }) => {
  const [open, setOpen] = useState(false);
  return (
    <div id="layout" className="layout">
      <Sidebar open={open} setOpen={() => setOpen(false)} />
      <Header
        setOpen={() => setOpen(true)}
        given_name={userinfo.name}
        family_name={userinfo.lastname}
        picture={userinfo.picture}
        email={userinfo.email}
      />
      <div className="position-relative">
        {children}
        <Footbar />
      </div>
    </div>
  );
};

export default Layout;
