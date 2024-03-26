
import DisconnectMagicButton from "../../magic/DisconnectMagicButton";
import ShowMagicUIButton from "magic/ShowMagicUIButton";
import { useMagic } from "magic/magicContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
// reactstrap components
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
  Button
} from "reactstrap";

import { useAccount, useDisconnect } from 'wagmi'

const AdminNavbar = (props) => {
  const { address, isConnected } = useAccount()
  const { magicAddress, isMagicConnected, provider , signer} = useMagic()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate();
  async function logoutUser(e) {
    console.log("Disconnect called")
    e.preventDefault();
    disconnect();
    navigate("/auth", {replace: true});
  }
  console.log("Wagmi Connected: " + isConnected)
  console.log("Magic Connected: " + isMagicConnected)

  return (
    <>
      {isConnected || isMagicConnected || <Navigate to="/" replace={true} />}
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/"
          >
            {props.brandText}
          </Link>
          <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
            <FormGroup className="mb-0">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-search" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input placeholder="Search" type="text" />
              </InputGroup>
            </FormGroup>
          </Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="..."
                      src={require("../../assets/img/theme/sketch.jpg")}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {address ||  (<ShowMagicUIButton buttonText={magicAddress}></ShowMagicUIButton>)}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome!</h6>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-single-02" />
                  <span>My profile</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-settings-gear-65" />
                  <span>Settings</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-calendar-grid-58" />
                  <span>Activity</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-support-16" />
                  <span>Support</span>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem >
                  <i className="ni ni-user-run" />
                  {isConnected?(<Button className="btn-primary" onClick={(e) => {logoutUser(e)}}>Logout</Button>):
                  (<DisconnectMagicButton></DisconnectMagicButton>)}
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
