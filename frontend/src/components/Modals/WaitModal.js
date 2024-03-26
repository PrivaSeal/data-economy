import React, { useState } from 'react';
import { Button, Modal, Form, ModalHeader, ModalBody, ModalFooter, FormGroup, InputGroup, InputGroupAddon, Input, InputGroupText, Label } from 'reactstrap';

function WaitModal({modal, toggle, args}) {


  return (
    <div>

      <Modal isOpen={modal} toggle={toggle} {...args}>
        <ModalHeader toggle={toggle}>Confirming Transaction</ModalHeader>
        <ModalBody>
            Please wait.....
        </ModalBody>
        <ModalFooter>

        </ModalFooter>
      </Modal>
    </div>
  );
}

export default WaitModal;