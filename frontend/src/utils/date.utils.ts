/**
 * 日期工具函数集合
 */

/**
 * 格式化日期为指定格式
 * @param date 日期对象或时间戳
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | number | string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hour = d.getHours()
    const minute = d.getMinutes()
    const second = d.getSeconds()

    return format
        .replace('YYYY', year.toString())
        .replace('MM', month.toString().padStart(2, '0'))
        .replace('DD', day.toString().padStart(2, '0'))
        .replace('HH', hour.toString().padStart(2, '0'))
        .replace('mm', minute.toString().padStart(2, '0'))
        .replace('ss', second.toString().padStart(2, '0'))
}

/**
 * 获取相对时间描述
 * @param date 日期对象或时间戳
 * @returns 相对时间描述（如：刚刚、x分钟前、x小时前等）
 */
export const getRelativeTime = (date: Date | number | string): string => {
    const now = new Date().getTime()
    const timestamp = new Date(date).getTime()
    const diff = now - timestamp

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const month = 30 * day
    const year = 12 * month

    if (diff < minute) {
        return '刚刚'
    } else if (diff < hour) {
        return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
        return `${Math.floor(diff / hour)}小时前`
    } else if (diff < month) {
        return `${Math.floor(diff / day)}天前`
    } else if (diff < year) {
        return `${Math.floor(diff / month)}个月前`
    } else {
        return `${Math.floor(diff / year)}年前`
    }
}

/**
 * 获取指定日期的开始时间
 * @param date 日期对象
 * @returns 日期开始时间（0点0分0秒）
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * 获取指定日期的结束时间
 * @param date 日期对象
 * @returns 日期结束时间（23点59分59秒）
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
}

/**
 * 判断是否为同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 是否为同一天
 */
export const isSameDay = (date1: Date | number | string, date2: Date | number | string): boolean => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    )
}

/**
 * 获取两个日期之间的天数差
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差
 */
export const getDaysDiff = (date1: Date | number | string, date2: Date | number | string): number => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diff = Math.abs(d1.getTime() - d2.getTime())
    return Math.floor(diff / (24 * 60 * 60 * 1000))
}

/**
 * 日期加减
 * @param date 日期对象
 * @param amount 要加减的数量
 * @param unit 单位：'day' | 'month' | 'year'
 * @returns 计算后的新日期
 */
export const addDate = (
    date: Date,
    amount: number,
    unit: 'day' | 'month' | 'year' = 'day'
): Date => {
    const d = new Date(date)
    switch (unit) {
        case 'day':
            d.setDate(d.getDate() + amount)
            break
        case 'month':
            d.setMonth(d.getMonth() + amount)
            break
        case 'year':
            d.setFullYear(d.getFullYear() + amount)
            break
    }
    return d
}

/**
 * 获取指定月份的天数
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 该月的天数
 */
export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate()
}

/**
 * 判断是否为闰年
 * @param year 年份
 * @returns 是否为闰年
 */
export const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}
