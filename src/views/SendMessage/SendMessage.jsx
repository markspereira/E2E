import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles'
import Hidden from '@material-ui/core/Hidden'
import Blockies from 'react-blockies'
// core components
import Card from 'components/Card/Card.jsx'
import CardHeader from 'components/Card/CardHeader.jsx'
import CardBody from 'components/Card/CardBody.jsx'
import Switch from '@material-ui/core/Switch';
import SendButton from 'components/Buttons/SendButton.jsx'
import InputField from 'components/InputField/InputField.jsx'
import GasCounter from 'components/GasCounter/GasCounter.jsx'
import TextField from '@material-ui/core/TextField';
import Close from '@material-ui/icons/Close'
import InputDropdown from 'components/InputDropdown/InputDropdown.jsx'
import { FadeLoader } from 'react-spinners'
import Tick from 'components/common/tickcross/Tick.jsx'
import Cross from 'components/common/tickcross/Cross.jsx'

// styles
import sendMessageStyle from "assets/jss/layouts/sendMessageStyle.jsx";

class SendMessagePage extends React.Component {

  state = { 
    encrypt: true,
    gasUse: "51000",
    recipient: this.props.currentReply,
    message: '',
    validRecipient: false,
    contacts: this.props.contacts,
  };

  // update state on-change
  async handleChange(event) { 
    //TODO: Make this more elegant. Icon to display if public key or not
    //exists.

    await this.setState({[event.target.name]: event.target.value})

    // if the address has a '.' in it with at least 3 letters after it, lets check if there is an ens address
    let recipient = this.state.recipient;
    if (recipient.length - recipient.indexOf('.') > 3 && recipient.indexOf('.') > 0) { 
      try {
        let ensAddress = await this.props.ens.resolver(recipient).addr()
        await this.setState({recipient: ensAddress})
        await this.setState({validRecipient: true});
      }
      catch(err) {} // ENS throws if name not found
    }

    this.checkGasPrice() 

    if (this.state.recipient.length === 40 || this.state.recipient.length === 42) {
       // check for correct address
       if (this.props.web3.utils.isAddress(this.state.recipient))  {
          this.props.checkForPubKey(this.state.recipient);
          return
       }
   } 
    if (this.props.pubkeyStatus != 'NONE')
      this.props.clearPubkeyStatus(); 
  }

  checkGasPrice() { 
    const { network, contractInstance, account } = this.props; 

    if (network === undefined || contractInstance.address === null) {
      this.state.gasUse = "network unavailable"
      return
    }

    let recipient = this.state.recipient;
    if(this.state.recipient === '') {
      this.setState({validRecipient: false})
      contractInstance.methods.send(
          "0x1234567890123456789012345678901234567890",
          this.state.message
      ).estimateGas({from: account, gas:1e6}, (err, gas) => { 
        if (gas == 1e6){
          this.setState({gasUse:'revert'});
        }
        else
          this.setState({gasUse: gas});
      });
    } else if(!this.props.web3.utils.isAddress(recipient)) {
      this.setState({
        gasUse: "invalid recipient address",
        validRecipient: false,
      })
      return
    } else {
      this.setState({validRecipient: true})
      contractInstance.methods.send(
          recipient,
          this.state.message
      ).estimateGas({from: account, gas:1e6}, (err, gas) => { 
        if (gas == 1e6){
          this.setState({gasUse:'revert'});
        }
        else
          this.setState({gasUse: gas});
      });
    }
  }

  // creates the sendMessage action
  sendMessage() { 
    const { network, contractInstance, account, recipientPubKey } = this.props; 
    // ensure the recpient address is correct
    if(!this.props.web3.utils.isAddress(this.state.recipient)) {
      alert("Incorrect Address") 
      return
    }

    // ensure the contract is known for this network
    if (network === undefined || contractInstance.address === null) {
      alert("network unavailable");
      return
    }

    if (this.state.encrypt && recipientPubKey === undefined) { 
      alert("A known public key is required to perform encryption.\n Either enter an account that has done a transaction, or enter the public key manually. See help for further details");
      return;
    }

    let recipient = this.state.recipient;
    let message = this.state.message; 

    
    this.props.sendMessage(contractInstance, recipient, recipientPubKey, message, account, this.state.encrypt);
  }

  handleEncryptToggleChange = () => {
    this.setState({ encrypt: !this.state.encrypt });
  };

  render() {
    const { classes, currentReply, pubkeyStatus } = this.props;
    
    const smallGC = classNames({
      [classes.gasCounter]: true,
      "sm": true
    })

    return (
      <Card className={classes.card}>
        <CardHeader color="primary">
          <h4 className={classes.cardTitleWhite}>New Message</h4>
        </CardHeader>
        <CardBody>


        <form className={classes.container} noValidate autoComplete="off">
          <div className={classes.recipient}>
          <Hidden xsDown>
          <section className={classes.recipientIconContainer}>
          { this.state.validRecipient &&
            <Blockies
              seed={this.state.recipient.toLowerCase()}
              size={8}
              scale={6}
            />
          }
          { !this.state.validRecipient &&
              <section className={classes.invalidRecipientIcon}>
                <Close />
              </section>
          }
          </section>
          </Hidden>
          <InputDropdown 
            options={
              this.props.contacts
            }
            sendChangeHandler={this.handleChange.bind(this)}
            name="recipient"
            initial={this.state.recipient}
       
      />
      {
      //TODO: Fix this loader
      }
          <FadeLoader 
          sizeUnit={'px'}
          radius={5}
          color={'#777'} 
          loading={pubkeyStatus === 'PENDING'}
          />
      { pubkeyStatus === 'SUCCESS' && 
        <Tick />
      }
      { ( pubkeyStatus === 'NOTFOUND' || pubkeyStatus === 'ERROR') && 
        <Cross />
      }
      {
          // <InputField
          //   title="Recipient"
          //   id="to-recipient"
          //   name="recipient"
          //   onChange={this.handleChange.bind(this)}
          //   value={this.state.recipient}
          //   classes={classes}
          // />
      }
          </div>
          <div>
          <TextField
            id="multiline-static"
            label="Message"
            multiline
            rows="10"
            defaultValue=""
            className={classes.textField}
            margin="normal"
            name="message"
            onChange={this.handleChange.bind(this)}
          />
          </div>
          <section>
          <Hidden smDown>
          <div className={classes.gasCounter}>
            <GasCounter
              classes={classes}
              id="gas-counter"
              gas={this.state.gasUse} 
            />
          </div>
          <div className={classes.actionContainers}>
            <span>Encrypt
            <Switch 
              color="primary"
              checked={this.state.encrypt}
              onChange={this.handleEncryptToggleChange}
            />
            </span>
            <SendButton
              classes={classes}
              onClick={this.sendMessage.bind(this)}
             />
          </div>
          </Hidden>
          <Hidden mdUp>
            <div className={smallGC}>
              <GasCounter
                classes={classes}
                id="gas-counter"
              />
            </div>
            <span>Encrypt
            <Switch 
              color="primary"
              checked={this.state.encrypt}
              onChange={this.handleEncryptToggleChange}
            />
            </span>
            <SendButton
              classes={classes}
              onClick={this.sendMessage.bind(this)}
             />
          </Hidden>
          </section>
        </form>
        </CardBody>
      </Card>
    );
  }
}

SendMessagePage.proptypes = {
  classes: PropTypes.object,
  currentReply: PropTypes.string.isRequired,
}

export default withStyles(sendMessageStyle)(SendMessagePage);
