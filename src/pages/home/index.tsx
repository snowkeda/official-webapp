import React, { useMemo } from "react";
import { connect } from 'umi'
import { Table, message, Tabs } from 'antd'
// import { withRouter, setLocale, connect, FormattedMessage, getAllLocales, useIntl, getIntl  } from 'umi';
import { web3, utbDecimal, utbAddress, wethAddress, buildAndSendApproveTx, wethAmount, utbAmount } from '@/utils/utbEx'
import { optionsAddress, optionsContract } from '@/utils/optionEx'
import HeaderBox from "@/components/HeaderBox/index"
import ChartLine from "@/components/ChartLine"
import CurrencyTab from "@/components/CurrencyTab"
import Trade from "@/components/Trade/Trading"
import History from "@/components/NavBar/history"
import Ranking from "@/components/NavBar/rank"
import development from '@/assets/img/home/under.png'
import styles from './index.scss';

@connect((obj) => {
  const {trade, wallet, chartConfig, websocket, global, loading} = obj;
  return {
    trade,
    wallet,
    chartConfig,
    websocket,
    global,
    fetchLoading: loading.effects['trade/getHistory'] || false,
  }
})
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.intervalEpochInfo = null;
    this.intervalEpochResult = null;
    this.ws1 = [];
    this.state = {
      activeNav: false,
      tableData: [],
      pageObj: {
        list: [],
        pageNum: 0,
        pageSize: 10,
        pages: 0,
        total: 0,
      },
      oldEpoch: 0,
      epochPeriod: 0,
      getEpochInfoNum: 0,
      getEpochResultNum: 0,
    }
    // const { config } = SDK
    // this.wsStore = props.websocket.wsStore
  }
  async componentDidMount() {
    const { chartConfig } = this.props;
    this.getChartConfig();
    // setTimeout(() => {
    //   console.log(this.wsStore.wsData.ws2)
    // });
    // this.wsStore.sendReq(2, {
    //   currency: 'ETH'
    // })
    // console.log(this.wsStore.wsData.ws2)
    // websocket.wsStore.sendReq(2, {
    //   currency: 'ETH'
    // })
    // websocket.wsStore.sendReq(1, {
    //   currency: 'ETH'
    // })
    // dispatch({
    //   type: "websocket/realTimeData"
    // })
  }
  
  async componentDidUpdate(prevProps, prevState) {
    const { websocket, dispatch, trade, wallet, chartConfig, global } = this.props;
    const { userAddressList } = wallet;
    const { wsData } = websocket
    const { searchSettle, betCPList } = trade
    if (chartConfig.assetName !== prevProps.chartConfig.assetName) {
      this.getChartConfig();
    }
    if (wsData.ws1 && prevProps.websocket.wsData.ws1 !== wsData.ws1) {
        this.getOldEpoch(wsData.ws1)
    }
    if (prevProps.trade.betCPList !== betCPList && searchSettle) {
      if (this.intervalEpochInfo === null) {
        this.intervalEpochInfo =  setInterval(this.getUserEpochInfo, 1000)
      }
    }
    // setInterval(this.getEpochResult, 600)
    // console.log(this.state.wsData)
  }

  // 控制render
  // shouldComponentUpdate(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean {
  //   const { tableData, activeNav } = this.state
  //   if (tableData !== nextState.tableData  || activeNav !== nextState.activeNav) {
  //     return true
  //   }
  //   return false
  // }

  getChartConfig = async () => {
    const { dispatch, chartConfig } = this.props;
    const { assetName } = chartConfig;
    // 获取每轮多少个块
    await optionsContract.methods
    .epochPeriod(assetName)
    .call().then( async (res) => {
      const ep = web3.utils.toNumber(res)
      await dispatch({
        type: "chartConfig/set",
        payload: {
          epochPeriod: ep
        }
      })
      await this.setState({
        epochPeriod: ep
      })
    })
    // 间距
    await optionsContract.methods
    .epochStopBetBlockCount(assetName)
    .call().then( async (res) => {
      const spacing = web3.utils.toNumber(res)
      await dispatch({
        type: "chartConfig/set",
        payload: {
          spacing
        }
      })
    })
  }

  handleSearch = async (pageNum) => {
    const { tableData, pageObj } = this.state;
    const { dispatch, wallet } = this.props;
    // const { wsData } = websocket
    // this.getUserEpochInfo()

    // 已经结算订单记录
    if (wallet.userAddressList.length > 0) {
      const psCsRes = await dispatch({
        // type: 'trade/getBetPsCs',
        type: 'trade/getHistory',
        payload: {
          user: wallet.userAddressList[0].toLowerCase(),
          pageSize: pageObj.pageSize,
          pageNum,
        }
      })
      if (pageNum === 1) {
        this.setState({
          tableData: [...psCsRes.data.list],
          pageObj: psCsRes.data,
        })
      } else if (pageObj.pages >= pageNum) {
        this.setState({
          tableData: [...tableData, ...psCsRes.data.list],
          pageObj: psCsRes.data,
        })
      }
    }
  }

  handleActiveNav = (isSearch) => {
    const { dispatch, wallet } = this.props
    if (wallet.userAddressList.length === 0) {
      dispatch({
        type: 'wallet/setOpenWallet',
        payload: { openWallet: true }
      }).then(() => {
        setTimeout(() => {
          this.handleSearch(1)
        }, 500);
      })
      return 
    } 
    if (isSearch) {
      this.handleSearch(1)
    }
    this.setState({
      activeNav: !this.state.activeNav
    })
  }
  // 修改币种
  setAssetName = (item) => {
    this.props.dispatch({
      type: "chartConfig/set",
      payload: {
        assetName: item.assetName
      }
    })
  }

  getOldEpoch = (obj) => {
    const { oldEpoch, epochPeriod } = this.state
    const { dispatch } = this.props;
    const { blockNum } = obj
    if (blockNum - (blockNum % epochPeriod)!=oldEpoch) {
      const oldEpochN = blockNum - (blockNum % epochPeriod);
      this.setState({
        oldEpoch: oldEpochN
      })
      dispatch({
        type: 'chartConfig/set',
        payload: {
          oldEpoch: oldEpochN
        },
      })
    }
      // if (blockNum - (blockNum % res)!=oldEpoch){
      //   oldEpoch = blockNum - (blockNum % res);
      //   // 调用请求当前订单  
      //   console.log(oldEpoch)
      // }
    
  }
  // 获取订单记录
  getUserEpochInfo = async () => {
    const { oldEpoch, getEpochInfoNum } = this.state
    const { wallet, dispatch, websocket, trade, chartConfig } = this.props;
    const { wsData } = websocket;
    const { betCPList } = trade;
    const { ws1 } = wsData;
    // console.log(ws1)
    // const d = {
    //   amount: betCPList.slice(-1)[0].price,
    //   blockNumber: ws1.blockNum,
    //   epoch: 1,
    //   rate: 1,
    //   x: ws1.blockNum,
    //   y: ws1.price,
    //   type: betCPList.slice(-1)[0].type
    // }
    // console.log(d)
    // this.ws1 = [...this.ws1, d]
    // dispatch({
    //   type: "trade/set",
    //   payload: { 
    //     searchSettle: false,
    //     epochInfoList: this.ws1,
    //   }
    // })
    // clearInterval(this.intervalEpochInfo)
    const getE = async (numEpoch) => {
      this.setState({
        getEpochInfoNum: getEpochInfoNum + 1
      })
      return await optionsContract.methods
      .getUserEpochInfo(chartConfig.assetName, wallet.userAddressList[0], numEpoch)
      .call()
      .catch((err) => {
        console.log(err)
        return []
      });
    } 
    const oRes = await getE(oldEpoch)
    const nRes = await getE(oldEpoch+ chartConfig.epochPeriod)
    const all = [...oRes, ...nRes];
    // console.log(`未结算订单记录:${numEpoch}`, res)
    let arr = []
    console.log(`未结算订单记录:${oldEpoch}`, all)
    all.map((item, index) => {
      const d = {
        amount: item.amount.toString() / utbDecimal,
        blockNumber: item.blockNumber.toString(),
        epoch: item.epoch.toString(),
        rate: item.rate.toString()/10000,
        x: item.blockNumber.toString(),
        type: betCPList.slice(-1)[0].type
      }
      arr.push(d)
    })
    
    arr.sort(function(a, b){ return b.blockNumber - a.blockNumber})

    if (all.length !== 0 || getEpochInfoNum > 6) {
      dispatch({
        type: "trade/set",
        payload: { 
          searchSettle: false,
          epochInfoList: arr,
        }
      })
      clearInterval(this.intervalEpochInfo)
      this.intervalEpochInfo = null
    }
  }

  // 获取结算订单
  getEpochResult = async () => {
    const { oldEpoch, epochPeriod } = this.state
    const { wallet, dispatch, websocket, trade, chartConfig } = this.props;
    console.log(`getEpochResult: ${oldEpoch}`)
    const getResult = async (oldEpoch) => {
      return await optionsContract.methods.getUserEpochResult(chartConfig.assetName, wallet.userAddressList[0], oldEpoch)
      .call()
    }
    const settlementEpoch = oldEpoch - epochPeriod;
    // await dispatch({
    //   type: "trade/set",
    //   payload: { 
    //     totalAmount: 0.2,
    //     settlementFlag: trade.settlementFlag + 1,
    //   }
    // })
    console.log(trade.epochInfoList)
    if (trade.epochInfoList.length > 0) {
      this.intervalEpochResult = setInterval(async () => {
        this.setState({
          getEpochResultNum: this.state.getEpochResultNum + 1,
        });
        const eRes = await getResult(oldEpoch - epochPeriod);
        console.log(oldEpoch - epochPeriod,  settlementEpoch)
        // 获取结算状态
        const keccakStr = web3.utils.keccak256(web3.eth.abi.encodeParameters(
          ["string","uint256" ],
          [chartConfig.assetName, oldEpoch - epochPeriod]
        ))
        console.log(keccakStr)
        // 结算状态 返回 true/false
        const settledEpoch = await optionsContract.methods.settledEpoch(keccakStr).call()
        console.log(settledEpoch, this.state.getEpochResultNum)
        if (settledEpoch && this.state.getEpochResultNum < 20) {
          const list = await optionsContract.methods.getUserEpochInfo(chartConfig.assetName, wallet.userAddressList[0], settlementEpoch).call()
          let totlaA = 0n;
          let epochInfoList = trade.epochInfoList;
          list.length > 0 && list.map(item => {
            let an = item.amount;
            epochInfoList = epochInfoList.filter(ril => {
              return ril.blockNumber !== item.blockNumber.toString()
            })
            if (item.amount < 0) {
              an = item.amount * -1n
            }
            totlaA = totlaA + an
          })
          // 获取余额 utb
          setTimeout(() => {
            dispatch({
              type: 'wallet/getUtbBalance'
            })
          }, 1000);
          const totalAmount = (eRes - totlaA).toString() / utbDecimal;
          const st = await dispatch({
            type: "trade/set",
            payload: { 
              totalAmount,
              epochInfoList,
              settlementFlag: trade.settlementFlag + 1,
            }
          })
          clearInterval(this.intervalEpochResult)
          this.intervalEpochResult = null
        }
      }, 2000)
    } 
  }
  
  tradeOn = async () => {
    const { dispatch, trade } = this.props;
    this.intervalEpochResult = setInterval(async () => {
      const st = await dispatch({
        type: "trade/set",
        payload: { 
          // totalAmount: eRes - totlaA,
          totalAmount: 1,
        }
      });
      clearInterval(this.intervalEpochResult)
      this.intervalEpochResult = null
    }, 600)
  }

  tips = () => {
    message.open({
      icon: null,
      content: 'Functionality under development',
      className: "global-tips",
    })
  }

  getSpotList = () => {
  }

  development = () => {
    return <div className={styles['under-development']}>
      <img src={development} />
      <p>Functionality under development</p>
    </div>
  }

  render() {
    const { tableData, activeNav, pageObj } = this.state;
    const { wsData } = this.props.websocket;
    const { userAddress } = this.props.wallet;
    // 控制抽屉动画
    const drawerStyle = activeNav ? { transform: 'translateX(102%)' } : null;
    // const tableArr = useMemo(() =>{
    //   return tableData
    // }, [tableData])
    const NavList= [
      {
        key: '1',
        label: 'Position',
        children: this.development(),
      },
      {
        key: '2',
        label: 'Total portfolio',
        children: this.development(),
      },
      {
        key: '3',
        label: 'Spots',
        children: this.development(),
      },
      {
        key: '4',
        label: 'History',
        children: <History tableData={tableData} handleSearch={this.handleSearch} pageObj={pageObj} fetchLoading={this.props.fetchLoading} />,
      },
      {
        key: '5',
        label: 'Rank',
        children: <Ranking navName='rank' chartConfig={this.props.chartConfig} userAddress={userAddress} />
      },
    ]
    return(
      <div className={styles['home-box']}>
        <HeaderBox />
        <CurrencyTab setAssetName={this.setAssetName} wsData={wsData} />
        <ChartLine settlement={this.getEpochResult} />
        <Trade />
        <Tabs 
          defaultActiveKey='1' 
          items={NavList} 
          className={styles['nav-list']} 
          destroyInactiveTabPane={true}
          indicatorSize={(origin) => origin + 16} 
          onTabClick={(activeKey) => {
            if (activeKey == 4){
              this.handleActiveNav('history')
            }
          }}
        />
      </div>
    )
  }
}
export default Index
