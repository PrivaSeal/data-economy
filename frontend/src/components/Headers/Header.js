
// reactstrap components
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

const Header = ({privaSealData}) => {
  console.log(privaSealData)
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row>
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"180px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                        Created Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {privaSealData?.createdTerms?.length || 0}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
                    </Row>
                    {/* <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-success mr-2">
                         Accepted Terms :{privaSealData?.length}

                      </span> */}
                      {" "}
                      {/* <br></br>
                      <span className="text-wrap text-red">Used Balance : {privaSealData && parseFloat(privaSealData?.balance - privaSealData?.availableBalance).toFixed(3)}</span>
                    </p> */}
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"180px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Accepted Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">{privaSealData?.acceptedTerms?.length}</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-chart-pie" />
                        </div>
                      </Col>
                    </Row>
                    {/* <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-success mr-2">
                        Active Keys : {privaSealData?.keys?.totalActiveKeys}
                      </span>
                      <br />
                      <span className="text-wrap text-danger"> Revoked Keys: {privaSealData?.keys?.totalRevokedKeys}</span>
                    </p> */}
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"180px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Rejected Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">{privaSealData?.rejectedTerms?.length }</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                          <i className="fas fa-users" />
                        </div>
                      </Col>
                    </Row>
                    {/* <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-primary mr-2">
                        Total Storage Capacity: {(privaSealData?.storageCapacity/1024/1024)?.toFixed(2)}&nbsp;&nbsp;MB
                      </span>
                      <span className="text-nowrap text-danger">
                        Used Storage: {(privaSealData?.storageUsed/1024/1024)?.toFixed(2)}&nbsp;&nbsp;MB
                      </span>
                    </p> */}
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"180px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Revoked Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">{privaSealData?.revokedTerms?.length}</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                          <i className="fas fa-percent" />
                        </div>
                      </Col>
                    </Row>
                    <p className="mt-3 mb-0 text-muted text-sm">
                      {/* <span className="text-success mr-2">
                        <i className="fas fa-arrow-up" /> 12%
                      </span>{" "}
                      <span className="text-nowrap">Since last month</span> */}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>



            <Row className="mt-4">
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"180px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                        Private Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {privaSealData?.privateTerms?.length || 0}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
                    </Row>
                    {/* <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-success mr-2">
                         Accepted Terms :{privaSealData?.length}

                      </span> */}
                      {" "}
                      {/* <br></br>
                      <span className="text-wrap text-red">Used Balance : {privaSealData && parseFloat(privaSealData?.balance - privaSealData?.availableBalance).toFixed(3)}</span>
                    </p> */}
                  </CardBody>
                </Card>
              </Col>

              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"180px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                        Escrow Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {privaSealData?.escrowTerms?.length || 0}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
                    </Row>
                    {/* <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-success mr-2">
                         Accepted Terms :{privaSealData?.length}

                      </span> */}
                      {" "}
                      {/* <br></br>
                      <span className="text-wrap text-red">Used Balance : {privaSealData && parseFloat(privaSealData?.balance - privaSealData?.availableBalance).toFixed(3)}</span>
                    </p> */}
                  </CardBody>
                </Card>
              </Col>

              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"180px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                        Token Spending Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {privaSealData?.tokenSpendingTerms?.length || 0}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
                    </Row>
                    {/* <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-success mr-2">
                         Accepted Terms :{privaSealData?.length}

                      </span> */}
                      {" "}
                      {/* <br></br>
                      <span className="text-wrap text-red">Used Balance : {privaSealData && parseFloat(privaSealData?.balance - privaSealData?.availableBalance).toFixed(3)}</span>
                    </p> */}
                  </CardBody>
                </Card>
              </Col>
  
            </Row>
            
          </div>
        </Container>
      </div>
    </>
  );
};

export default Header;
