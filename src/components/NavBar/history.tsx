import React, { useEffect,  useState, useCallback, useMemo, memo } from "react";
import VirtualList from "rc-virtual-list"
import { List, Spin } from 'antd'
import moment from "moment";
import { utbDecimal } from '@/utils/utbEx'
import { getDecimal } from '@/utils/format'
import styles from './history.scss'

const History = (props) => {
  const { tableData, pageObj, fetchLoading } = props;
  const [ pageNum, setPageNum ] = useState(2)
  const [ navigationBarHeight, setNavigationBarHeight ] = useState(0)

  const tableArr = useMemo(() => {
    return tableData.sort(function(a, b){ return b.blockNumber - a.blockNumber})
  }, [tableData])

  const onVisibleChange = (visibleList, fullList) => {
    console.log(visibleList)
    console.log(fullList)
    const leng = fullList.length;
    if (pageObj.pages >= pageNum) {
      props.handleSearch(pageNum)
      setPageNum(pageNum+1)
    }
  }
  
  return (
    <Spin spinning={fetchLoading}>
      <div className={styles['history-box']} id="history">
        <List className={styles['history-list']} >
          {
            !fetchLoading && tableArr.length === 0 
              ? <div className={styles['empty-box']}>No Data</div> : ''
          }
          <VirtualList
            data={tableArr}
            // height={300}
            itemHeight={72} 
            itemKey="blockNumber"
            styles={{paddingbottom: 20}}
            onVisibleChange={onVisibleChange}
            // onScroll={onScroll}
          >
            {(item) => {
              const pnl = Number(item.pnl)
              const amount = Number(item.amount);
              const flag = pnl > 0 ? styles['green'] : styles['red'];
              const income = pnl > 0 ? pnl : amount;
              return (
                <div className={styles['item']} key={item.blockNumber}>
                  <div className={styles['time']}>
                    <span className={styles['hm']}>{moment(item.gmtCreate).format('HH:mm')}</span>
                    <span className={styles['mmm']}>{moment(item.gmtCreate).format('DD MMM')}</span>
                  </div>
                  <span className={styles['blockNumber']}>{item.blockNumber}</span>
                  <span className={`${styles['income']} ${flag}`}>{`${pnl > 0 ? '+' : '-'}${getDecimal(income, 6)}`}</span>
                </div>
              )
            }}
          </VirtualList>
       </List>
      </div>
    </Spin>
  )
}

export default History;
// export default memo(History, (prevProps, nextProps) => {
//   return prevProps.tableData.toString() === nextProps.tableData.toString()
// });
