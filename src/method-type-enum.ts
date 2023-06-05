export enum MethodType{
    /// 导航开始
    /// 路由打开新页面
    navigateTo,
    /// 路由返回
    navigateBack,
    /// 打开url
    launchUrl,
    /// 导航结束

    /// 弹框
    /// 对话框
    dialog,
    /// 时间选择
    dateTimeSelect,
    /// 动作面板
    actionSheet,
    /// 单选多选框
    selectSheet,
    /// toast,
    toast,
    /// 弹框结束

    /// 原生能力开始
    /// 发送http请求
    api,
    /// 相机拍照
    camera,
    /// 相册选择图片
    photo,
    /// 扫码
    scan,
    /// 发送短信
    sms,
    /// 拨打电话
    call,
    /// 原生能力结束

    /// 设置全局变量
    setGlobalVariable,
    /// 设置页面变量
    setPageVariable,
    /// 设置可见行
    setVisibility,
    /// 设置可用
    setEnable,
    /// 校验
    validate,
    /// 获取控件的值
    getWidgetValue,

    /// 方法工具 开始
    /// first
    arrayFirst,
    /// join
    arrayJoin,
    /// length
    stringLength,
    /// 加
    mathAdd,
    /// 减
    mathReduce,
    /// 乘
    mathTake,
    /// 除
    mathDivision,
    /// 大写转换
    upperCase,
    /// 小写转换
    lowerCase,
    /// 替换
    replaceAll,
    /// 日期时间格式化
    dateFormat,
    /// 字符串转日期
    dateParse,
    /// time difference 时间差
    timeDiff,
    /// 数组添加元素
    listAdd,
    /// 数组删除元素
    listDelete,
    /// 方法工具 结束

    /// 无，不做任何事情
    none
}

// declare enum MethodType{
//     /// 导航开始
//     /// 路由打开新页面
//     navigateTo,
//     /// 路由返回
//     navigateBack,
//     /// 打开url
//     launchUrl,
//     /// 导航结束
//
//     /// 弹框
//     /// 对话框
//     dialog,
//     /// 时间选择
//     dateTimeSelect,
//     /// 动作面板
//     actionSheet,
//     /// 单选多选框
//     selectSheet,
//     /// toast,
//     toast,
//     /// 弹框结束
//
//     /// 原生能力开始
//     /// 发送http请求
//     api,
//     /// 相机拍照
//     camera,
//     /// 相册选择图片
//     photo,
//     /// 扫码
//     scan,
//     /// 发送短信
//     sms,
//     /// 拨打电话
//     call,
//     /// 原生能力结束
//
//     /// 设置全局变量
//     setGlobalVariable,
//     /// 设置页面变量
//     setPageVariable,
//     /// 设置可见行
//     setVisibility,
//     /// 设置可用
//     setEnable,
//     /// 校验
//     validate,
//     /// 获取控件的值
//     getWidgetValue,
//
//     /// 方法工具 开始
//     /// first
//     arrayFirst,
//     /// join
//     arrayJoin,
//     /// length
//     stringLength,
//     /// 加
//     mathAdd,
//     /// 减
//     mathReduce,
//     /// 乘
//     mathTake,
//     /// 除
//     mathDivision,
//     /// 大写转换
//     upperCase,
//     /// 小写转换
//     lowerCase,
//     /// 替换
//     replaceAll,
//     /// 日期时间格式化
//     dateFormat,
//     /// 字符串转日期
//     dateParse,
//     /// time difference 时间差
//     timeDiff,
//     /// 数组添加元素
//     listAdd,
//     /// 数组删除元素
//     listDelete,
//     /// 方法工具 结束
//
//     /// 无，不做任何事情
//     none
// }
