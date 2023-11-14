import React, { useEffect,  useState, useCallback, useMemo, memo } from "react";
import { connect } from 'umi'
import VirtualList from "rc-virtual-list"
import { findIndex } from 'lodash'
import { Spin, Progress } from 'antd'
import Decimal from 'decimal.js'
import { getSubstring } from '@/utils/format'
import closeIcon from '@/assets/img/home/close-icon.png'
import styles from './rank.scss'

const Rank = (props) => {
  const { navName, handleClose, fetchLoading, dispatch, chartConfig, userAddress } = props;
  const {oldEpoch, epochPeriod} = chartConfig;
  const [data, setData] = useState([])
  const [activeTab, setActiveTab] = useState('WEEK');
  const [firstScore, setFirstScore] = useState(0)
  const [ userRank, setUserRank] = useState(-1)

  const getRecordRankEpoch = () => {
    if (oldEpoch !== 0) {
      dispatch({
        type: 'record/getOrderRecordRankEpoch',
        payload: {
          epoch: oldEpoch - epochPeriod,
          rank: 50
        }
      }).then((res) => {
        if (res.code === 0 ) {
          res.data.length > 0 && setFirstScore(res.data[0].score)
          const indexNum = findIndex(res.data, (i) => {
            return i.user == userAddress
          })
          setUserRank(indexNum)
          setData(res.data)
        }
      })
    }
    
  }
  const getRecordRankTime = (type) => {
    console.log(userAddress)
    dispatch({
      type: 'record/getOrderRecordRankTime',
      payload: {
        type,
        rank: 50
      }
    }).then((res) => {
      if (res.code === 0) {
        res.data.length > 0 && setFirstScore(res.data[0].score)
        const indexNum = findIndex(res.data, (i) => {
          return i.user == userAddress
        })
        setUserRank(indexNum)
        setData([...res.data])
      }
    })
  }
  
  useEffect(() => {
    if (navName === 'rank') {
      getRecordRankTime(activeTab)
    } 
  }, [navName]);

  const hClose = () => {
    handleClose()
  }
  const tab = [
    { name: 'This Week', value: 'WEEK' },
    { name: 'Today', value: 'DAY' },
    { name: 'Past Hour', value: 'HOUR' },
    { name: 'Last Round', value: 'epoch' },
  ]
  const handleTabChange = (value) => {
    setActiveTab(value)
    if (value === 'epoch') {
      getRecordRankEpoch()
    } else {
      getRecordRankTime(value)
    }
  }
  return (
    <>
      <div className={styles['nav-box']} id="rank">
        <div className={styles['content']}>
          <Spin spinning={fetchLoading}>
            {
              userRank !== -1 &&
              <div className={styles['my-rank']}>
                <h2>My Rank</h2>
                <div className={styles['num-score']}>
                  <span className={styles['num']}>{userRank+1}</span>
                  <span className={styles['score']}>{data[userRank].score}</span>
                </div>
              </div>
            }
            <div className={styles['rank-list']}>
              <ul>
                {tab.map((item) => {
                  return (
                    <li 
                      key={item.value} 
                      onClick={() => handleTabChange(item.value)} 
                      className={activeTab === item.value ? styles['active'] : ''}
                    >{item.name}</li>
                  )
                })}
              </ul>
              {
                !fetchLoading && data.length === 0 
                  ? <div className={styles['empty-box']}>No Data</div> : ''
              }
              <VirtualList
                className={styles['record']}
                data={data}
                // height={300}
                // height={navigationBarHeight - 250}
                // height={60}
                itemHeight={46} 
                itemKey="user"
                // onVisibleChange={onVisibleChange}
              >
                {
                  (item, index) => {
                    return (
                      <div>
                        <div className={styles['rank-box']} key={item.user}>
                          <div className={styles['rank-user']}>
                            <span className={`${styles['rank']} ${styles[`pm-${index}`]}`}>{index+1}</span>
                            <span className={styles['user']}>{getSubstring(item.user, 4, 4)}</span>
                          </div>
                          <span className={styles['score']}>{item.score}</span>
                        </div>
                        <Progress percent={Number(new Decimal(item.score).div(firstScore).mul(100).toFixed())} strokeColor="#00C253" trailColor="rgba(1,249,223,0.1)" showInfo={false} size={['100%', 1]} />
                      </div>
                    )
                  }
                }
              </VirtualList>
            </div>
          </Spin>
        </div>
      </div>
    </>
  )
}
/* @connect(({ loading }) => ({
  fetchLoading: loading.effects['record/getOrderRecordRankEpoch'] || false,
})) */
function mapStateToProps({ loading }) {
  return { fetchLoading: loading.effects['record/getOrderRecordRankEpoch'] || loading.effects['record/getOrderRecordRankTime'] || false, }
}
export default connect(mapStateToProps)(Rank);
