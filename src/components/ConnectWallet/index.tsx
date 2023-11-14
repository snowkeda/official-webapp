import React from 'react';
import { Modal,  } from 'antd';
import { connect } from 'umi'
import okWeb3 from '@okwallet/extension';
import { hooks, metaMask, metaMaskStore } from '@/connectors/metaMask'

import { CloseOutlined, CaretDownOutlined, LogoutOutlined } from '@ant-design/icons';
import MetaMaskWallet from '@/components/web3React/MetaMaskWallet'
import OkwWallet from '@/components/web3React/OkwWallet'

import { web3, utbContract, utbAddress, wethContract, wethAddress, wethDecimal, utbDecimal, wethAmount, utbAmount } from '@/utils/utbEx'
import { getDecimal, getSubstring } from '@/utils/format'
import { isH5 } from '@/utils';

import downIcon from '@/assets/img/header/downIcon.png'
import assetsIcon from '@/assets/img/home/assets-icon.png'
import cycleIcon from '@/assets/img/home/cycle.png'
import userIcon from '@/assets/img/home/u.png'
import walletIcon from '@/assets/img/wallet-icon.png'
import disconnect from '@/assets/img/disconnect.png'
import styles from './index.scss';

@connect(({wallet}) => ({
  wallet
}))
class Trade extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rotate: false,
      walletType: '',
    };
  }
  componentDidMount(): void {
    // console.log(metaMask)
   /*  const lsAccounts = localStorage.getItem('accounts')
    const { dispatch } = this.props;
    if (lsAccounts) {
      // 重新连接
      metaMask.connectEagerly().then(() => {
        const { accounts } = metaMaskStore.getState()
        dispatch({
          type: "wallet/set",
          payload: { userAddressList: accounts ? accounts : [] },
        })
      }).catch(() => {
        console.debug('Failed to connect eagerly to metamask')
        
      })
    } */
  }

  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void {
    const { wallet, dispatch } = this.props;
    const { userAddressList } = wallet;
    if (prevProps.wallet.userAddressList.length !== userAddressList.length && userAddressList.toString() !== '') {
      dispatch({
        type: "wallet/getUtbBalance",
      })
    }

  }

  componentWillUnmount() {
  }

  handleOKX = () => {
    window.okxwallet.request({ method: 'eth_requestAccounts' }).then((res) => {
      console.log(res)
    });
    // await okxwallet.request({
    //   method: 'wallet_switchEthereumChain',
    //   params: [{ chainId: '0xf00' }],
    // });
    // okxwallet.request({ method: 'eth_requestAccounts' });
    // if (typeof window.okxwallet !== 'undefined') {
    //   console.log('OKX is installed!');
    // } else {
    //   console.log('OKX on installed!');
    // }
  }

  handleModalVisible = (type) => {
    const { dispatch } = this.props;
    this.setState({
      walletType: type
    })
    dispatch({
      type: "wallet/setOpenWallet",
      payload: { openWallet: !this.props.wallet.openWallet },
    })
  };

  handleSwitch = (e) => {
    e.stopPropagation()
    console.log(22)
    this.setState({
      rotate: !this.state.rotate,
    })
  }

  handleQuit = async () => {
    localStorage.removeItem('accounts')
    const { walletType } = this.state;
 /*    console.log(okWeb3)
    const as = await window.okxwallet.request({ method: 'eth_requestAccounts' });
    console.log(as)
    okWeb3.addListener('connect', (isConnected) => {
      console.log(isConnected); // boolean
    }).ca; */
    if (walletType === 'MetaMaskWallet') {
      metaMask.deactivate?.()
      metaMask.resetState()
    }

    if(walletType === 'OkwWallet') {
      okWeb3.disconnect();
    }
    this.props.dispatch({
      type: "wallet/set",
      payload: { userAddressList: [] },
    })
    return null
  };

  render() {
    const { rotate } = this.state;
    const { userAddressList, utbBalance, openWallet } = this.props.wallet;
    console.log(rotate)
    return (
      <>
        <div className={styles['connect-wallet']}>
          {
            userAddressList.length > 0 && <>
              <span className={styles['user-box']}><img src={userIcon} />${utbBalance === 0 ? 0 : Number(getDecimal(utbBalance, 6))}</span>
              <button type='button' className={styles['user-quit']} onClick={this.handleSwitch}>
                <span className={styles['user-hash']}>{getSubstring(userAddressList[0], 4, 4)}</span>
                <span className={`${styles['assount-text']} ${rotate ? styles['open'] : styles['close']}`}><CaretDownOutlined className={styles['down-out']} /></span>
                <ul className={`${styles['user-list']}  ${rotate ? styles['open'] : styles['close']}`}>
                  <li className={styles['disconnect']} onClick={this.handleQuit}>
                    <img src={disconnect} alt="disconnect" />
                    <span>Disconnect</span>
                  </li>
                </ul>
              </button>
            </>
          }
          {
            userAddressList.length === 0 && <button type='button' className={styles['connect-wallet-btn']} onClick={() => this.handleModalVisible('wallet')}><img src={walletIcon} alt='Wallet' /><span>Connect</span></button>
          }
          <Modal className={styles['connect-wallet-modal']} onCancel={() => this.handleModalVisible()} open={openWallet} footer={null} closeIcon={null}>
            <div className={styles['content']}>
              <div className={styles['title-top']}>
                <span>Connect Wallet</span>
                <CloseOutlined onClick={() => this.handleModalVisible()} />
              </div>
              <div className={styles['wallet-choose']}>
               {/*  <div className={styles['what-wallet']}>
                  <h2>What is a Wallet?</h2>
                  <div className={styles['introduce']}>
                    <div className={styles['img-h']}>
                      <img src={assetsIcon} alt='' />
                      <span>A Home for vour Digital Assets</span>
                    </div>
                    <p className={styles['des']}>Wallets are used to send, receive.store, and display digital assets likeEthereum and NFTs.</p>
                  </div>
                  <div className={styles['introduce']}>
                    <div className={styles['img-h']}>
                      <img src={cycleIcon} alt='' />
                      <span>A New Wav to Log In</span>
                    </div>
                    <p className={styles['des']}>Instead of creating new accounts andpasswords on every website, just connect vour wallet.</p>
                  </div>
                </div> */}
                <div className={styles['choose']}>
                  <h2>Choose</h2>
                  <ul className={styles['choose-list']}>
                    <MetaMaskWallet name="Metamask" loginHandle={() => this.handleModalVisible('MetaMaskWallet')} desiredChainId={CHAIN_ID} />
                    <OkwWallet loginHandle={() => this.handleModalVisible('OkwWallet')} desiredChainId={DESIRED_CHAINID} />
                  </ul>
                </div>
              </div>
              
              
            </div>
          </Modal>
        </div>
      </>
    );
  }
}

export default Trade