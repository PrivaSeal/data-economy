
// reactstrap components

import { useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col, Button } from "reactstrap";
import {  Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


const CreatedTermsHeader = ({terms}) => {
 
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row className="justify-content-center mb-4">

              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"100px"}}>
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Created Terms
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">{terms.length}</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                          <i className="fas fa-check" />
                        </div>
                      </Col>
                    </Row>
                    
                  </CardBody>
                </Card>
              </Col>
  
              
            </Row>


            <Row className="justify-content-center">

             
              {/* <Col lg="12" xl="12" >
                <Card className="card-stats mb-4 mb-xl-0" style={{"height":"100px"}}>
                  <CardBody> */}
                 
                  {/* </CardBody>
                </Card>
              </Col> */}
              
            </Row>

           
          </div>
        </Container>
      </div>

    </>
  );
};

export default CreatedTermsHeader;
