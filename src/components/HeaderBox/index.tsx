import React, { useState } from "react";
import { connect, Link } from "umi"
import { message, Drawer } from 'antd'
import { CloseOutlined } from '@ant-design/icons';
import ConnectWallet from "@/components/ConnectWallet"
import airdrop from '@/assets/img/header/airdrop.png'
import menuIcon from '@/assets/img/header/menuIcon.png'
import binaxLogo from '@/assets/img/header/binax.png'
import dashboard from '@/assets/img/header/dashboard.png'
import earn from '@/assets/img/header/earn.png'
import swap from '@/assets/img/header/swap.png'
import dao from '@/assets/img/header/dao.png'
import trading from '@/assets/img/header/trading.png'
import rewards from '@/assets/img/header/rewards.png'
import docs from '@/assets/img/header/docs.png'
import styles from './index.scss'

const HeaderBox = (props) => {
  const { siteName } = props;
  const [ open, setOpen ] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();
  const openDrawer = (status) => {
    setOpen(status)
  }
  const menuList = [
    {title: 'Airdrop', icon: airdrop, link: '/airdrop', cName: 'airdrop'},
    {title: 'Trading', icon: trading, link: '/home', cName: 'trading'},
    {title: 'Dashboard', icon: dashboard, link: '/dashboard', cName: 'dashboard'},
    {title: 'Earn', icon: earn, link: '', cName: 'earn'},
    {title: 'Swap', icon: swap, link: '/swap', cName: 'swap'},
    {title: 'DAO', icon: dao, link: '', cName: 'dao'},
    {title: 'Rewards', icon: rewards, link: '', cName: 'rewards'},
    // {title: 'Docs', icon: docs, href: 'https://docs.binax.io/meet-binax/overview', link: '', cName: 'docs'},
  ]
  const tips = (e) => {
    e.preventDefault()
    messageApi.open({
      icon: null,
      content: 'Functionality under development',
      className: "global-tips",
    })
  }
  const MenuTop = () => {
    return (
      <div className={styles['menu-top']}>
        <img src={binaxLogo} alt="binax" />
        <CloseOutlined className={styles['menu-close']} onClick={() => openDrawer(false)} />
      </div>
    )
  }
  return(
    <section className={styles['header-box']}>
      <div className={styles['header-top']}>
        <div className={styles['menu-logo']}>
          <div className={styles['menu']} onClick={() => openDrawer(true)} >
            <img src={menuIcon} />
          </div>
          <div className={styles['logo']}>
            <img src={binaxLogo} alt="binax"  />
          </div>
        </div>
        <div className={styles['user-connect']}>
          <ConnectWallet />
        </div>
      </div>
      <Drawer 
        rootClassName={styles['menu-drawer']}
        title={<MenuTop />}
        open={open}
        placement='left'
        width={'83%'}
        closable={false}
        onClose={() => openDrawer(false)}
      >
        {contextHolder}
        <ul className={styles['menu-list']}>
          {
            menuList.map((item) => {
              return (
                <li className={styles[item.cName]} key={item.cName} >
                  {
                    item.link === '' ? <a onClick={tips} >
                      <img src={item.icon} alt={item.cName} />
                      <span>{item.title}</span>
                    </a> : 
                    <Link to={item.link} >
                      <img src={item.icon} alt={item.cName} />
                      <span>{item.title}</span>
                    </Link>
                  }
                </li>
              )
            })
          }
          <li>
            <a href="https://docs.binax.io/meet-binax/overview" target="_blank" >
              <img src={docs} alt="docs" />
              <span>Docs</span>
            </a>
          </li>
        </ul>
      </Drawer>
      {/* <div className={styles['left']}>
        {contextHolder}
        <Link to={'/'} ><img className={styles['logo']} src={logo} alt={siteName} /></Link>
        <ul className={styles['menu-list']}>
          <li className={styles['airport']}>
            <Link to={'/airdrop'}>
              <img src={block} alt="airdrop" />
              Airdrop
            </Link>
          </li>
          <li>
            <a onClick={tips}>Dashboard</a>
          </li>
          <li>
            <a onClick={tips}>Earn</a>
          </li>
          <li>
            <a onClick={tips}>Swap</a>
          </li>
          <li>
            <a onClick={tips}>DAO</a>
          </li>
          <li>
            <a onClick={tips}>Rewards</a>
          </li>
          <li>
            <a onClick={tips}>NFTs</a>
          </li>
          <li>
            <a href="https://docs.binax.io/meet-binax/overview" target="_blank" >Docs</a>
          </li>
        </ul>
      </div> */}
      {/* <div className={styles['right']}>
        <ConnectWallet />
      </div> */}
    </section>
  )
}
export default connect(
  ({global}) => ({
    siteName: global.siteName
  })
)(HeaderBox)
