import { connect } from 'react-redux';
import { sendMessage, checkForPubKey } from 'actions/sendMessageActions.js'

import SendMessagePage from 'views/SendMessage/SendMessage.jsx';

const mapStateToProps = state => {
  return {
    contacts: state.contacts.contacts,
    messageStatus: state.messages.status,
    messages : state.messages.messages,
    network: state.web3.contracts[state.web3.network],
    contractInstance: state.web3.contractInstance,
    web3: state.web3.web3,
    ens: state.web3.ens,
    account: state.web3.accounts.active,
    currentReply: state.messages.currentReply,
    recipientPubKey: state.sendMessage.pubkey,
    pubkeyStatus: state.sendMessage.pubkeyStatus
  }
};

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: (instance, recipient, recipientPubKey, message, account, encrypt) => {
      dispatch(sendMessage(instance, recipient, recipientPubKey, message, account, encrypt))
    },
    clearReply: () => {
      dispatch({type: 'CLEAR_REPLY'})
    },
    checkForPubKey: (web3, recipient) => {
      dispatch(checkForPubKey(web3, recipient))
    },
    clearPubkeyStatus: () => {
      dispatch({type: 'GET_PUBKEY', status: 'NONE'})
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendMessagePage)

