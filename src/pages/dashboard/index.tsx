import { useState, useEffect } from 'react'
import { connect } from 'umi'
import CountUp from 'react-countup';
import Highcharts from 'highcharts';
import HighchartsAnnotations from 'highcharts/modules/annotations'
import { addTokenWatchAsset, utbAddress } from '@/utils/utbEx'
// import { Progress } from 'antd'
import { getDashboard } from '@/fetch/apis';
import MyProgress from "./MyProgress"
import HeaderBox from "@/components/HeaderBox/index"
import OtherFooter from "@/components/footer/other"
import { multiply, divided } from '@/utils/calculate'
import wallet from "@/assets/img/dashboard/wallet.png"
import styles from './index.scss';

HighchartsAnnotations(Highcharts)

const Earn = () => {
  const tradeVolData = {
    volume: '',
    change: '',
  }
  const utbPriceData = {
    price: '',
    change: '',
    rate: '',
  }
  const gasFeeData = {
    gasFee: '',
    change: '',
  }
  const [data, setData] = useState({tradeVolData, utbPriceData, gasFeeData, pairs: [], utbApr: '', utbCompositions: [] });
  const initChart = (id, data) => {
    Highcharts.chart(id, {
      title: {
          text: '',
      },
      chart: {
        className: 'myChart',
        marginRight: 0,
        marginBottom: 0,
        spacingRight: 0,
        // zoomType: 'x', // 选中缩放
        panning: false, // 平移
        backgroundColor: 'transparent',
        animation: { duration: 500 },
      },
      credits: {
        enabled: false,
      },
      navigation: {
        menuStyle: { display: 'none' },
      },
      plotOptions: {
        series: {
          /* fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 1,
              y2: 0,
            },
            stops: [
              [0, 'rgba(0, 194, 83, 0)'],
              [1, 'rgba(0, 194, 83, 1)'],
            ],
          }, */
          color: 'rgba(0, 194, 83, 1)',
          lineWidth: 2,
          fillOpacity: 0.9,
          stickyTracking: false,
          // animation: false,
          dataLabels: {
            enabled: false,
          },
          marker: {
            enabled: false,
          },
        },
        cursor: 'pointer',
      },
      scrollbar: {
        enabled: false,
      },
      tooltip: {
        enabled: false
      },
      legend: {
        enabled: false,
      },
      series: [{
        type: 'spline',
        data,
        // keys: ['x', 'y', 'arrayParam'],
        animation: true,
        threshold: null,
        turboThreshold: 0,
        allowPointSelect: true,
        states: {
          hover: {
            enabled: false,
          }
        },
      }],
      xAxis: {
        visible: false,
      },
      yAxis: {
        visible: false,
      },
    })
  }
  useEffect(() => {
    async function fetchData() {
      const res = await getDashboard();
      if (res.code === 0) {
        setData(res.data);
        const { utbCompositions } = res.data;
        utbCompositions.map((item) => {
          const { list } = item;
          const arr = [];
          list.map((i) => {
            arr.push({
              ...i,
              x: i.time,
              y: i.positionAmount,
            })
          })
          setTimeout(() => {
            initChart(item.symbol, arr)
          }, 500);
        })
      }
    }
    fetchData();
  }, [])
  const addWallet = async () => {
    const res = await addTokenWatchAsset(utbAddress, 'UTB', 18);
  }
  return (
    <div className={styles['earn-box']}>
      <HeaderBox />
      <div className={styles['earn-content']}>
        <div className={styles['content']}>
          <section className={styles['earn-total']}>
            <h1>Dashboard</h1>
            <ul>
              <li className={styles['total-trading']}>
                <div className={styles['desc']}>Total Trading Volume</div>
                <h1>$<CountUp end={data.tradeVolData.volume} decimals={6} /></h1>
                <div className={`${styles['price']} ${ data.tradeVolData.change > 0 ? styles['green'] : styles['red']}`}>{Math.abs(data.tradeVolData.change)}</div>
              </li>
              <li className={`${styles['asset']} ${data.utbPriceData.rate > 0 ? styles['green'] : styles['red']}`}>
                <div className={styles['desc']}>UTB Price</div>
                <h2>{data.utbPriceData.price}</h2>
                <div className={styles['h2-price']}>{multiply(data.utbPriceData.rate, 100, undefined)}%</div>
              </li>
              <li className={`${styles['gas-fee']} ${styles['green']} `}>
                <div className={styles['desc']}>Gas Fee</div>
                <h2>${data.gasFeeData.gasFee}</h2>
                <div className={styles['h2-price']}>${data.gasFeeData.change}</div>
              </li>
            </ul>
          </section>
          <section className={styles['pairs']}>
            <h1>PAIRS</h1>
            <ul className={styles['pairs-list']}>
              {
                data.pairs.map((item) => {
                  return (
                    <li className={`${styles['eth']} ${styles[item.symbol]}`} key={item.symbol}>
                      <div className={styles['title']}>Last Price</div>
                      <p className={styles['price']}>${item.closePrice}</p>
                      <p className={styles['h-change']}>
                        <span className={`${styles['change']} ${item.dayChangeRate > 0 ? styles['green'] : styles['red']}`}>{multiply(item.dayChangeRate, 100, undefined)}%</span>
                        <span className={styles['h-change-time']}>/ 24h Change</span>
                      </p>
                    </li>
                  )
                })
              }
            </ul>
          </section>
          <section className={styles['compositio']}>
            <h1>UTB Index Compositio</h1>
            <div className={`${styles['arp']}`}>
              ARP<span className={`${ data.utbApr > 0 ? styles['green'] : styles['red']}`}>{multiply(data.utbApr, 100, undefined)}%</span>
            </div>
            <div className={styles['add_wallet']} onClick={addWallet}>
              <img src={wallet} />
              <span >Add UTB</span>
            </div>
            <ul className={styles['list']}>
              {
                data.utbCompositions.map((item, index) => {
                  return (
                    <li className={styles[item.symbol]} key={item.symbol}>
                      <h2>{item.symbol}</h2>
                      <div className={styles['progress']}>
                        <MyProgress percent={multiply(item.rate, 100, undefined)} />
                        {/* <Progress type="circle" percent={multiply(item.rate, 100, undefined)} 
                          strokeColor={"#0275F5"} 
                          trailColor={"#0D1517"}  
                          strokeWidth={6}
                          format={(number) => (
                            <>
                              <h3>{number}%</h3>
                              <p>Utilization</p>
                            </>
                          )} 
                        /> */}
                        <div id={item.symbol} className={styles['chart-box']} />
                      </div>
                      <p>
                        <span>Liquidity Provided</span>
                        <span>${item.positionValue}</span>
                      </p>
                      <p>
                        <span>Amount {item.symbol}</span>
                        <span>{item.positionAmount}</span>
                      </p>
                    </li>
                  )
                })
              }
            </ul>
          </section>
        </div>
        <OtherFooter />
      </div>
    </div>
  )
}

export default Earn