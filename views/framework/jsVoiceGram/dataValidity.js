/*坐标轴高度,坐标轴宽度,分割线高度,滚动条高度数据有效性验证*/
var dataCheck=function(){
    var axisHeight=document.getElementById("axisHeight").value; //获取坐标轴高度
    var axisWidth=document.getElementById("axisWidth").value;  //获取坐标轴宽度
    var panelSplitterHeight=document.getElementById("panelSplitterHeight").value;  //获取分割线高度
    var scrollBarHeight=document.getElementById("scrollBarHeight").value;  //获取滚动条高度
    
    check(axisHeight,0,25);  //检验坐标轴高度是否满足范围

    check(axisWidth,0,50);  //检验坐标轴宽度是否满足范围

    check(panelSplitterHeight,0,6);  //检验分割线高度是否满足范围

    check(scrollBarHeight,0,26);  //检验滚动条高度是否满足范围

};

var check=function(inputValue,startValue,endValue){
    if(!inputValue.match("^[0-9]*$") || inputValue<startValue || inputValue>endValue || inputValue==""){ //^[0-9]*$ 整数的正则表达式
        alert("只能输入"+startValue+"~"+endValue+"的整数");
    }
}


/*添加标记数据有效性检验*/
var _markDatacheck=function(){

    var rangeHS=parseFloat(document.getElementById("rangeHS").innerHTML);  //横坐标开始位置
    var rangeHE=parseFloat(document.getElementById("rangeHE").innerHTML);  //横坐标结束位置
    var MarkStartTime=document.getElementById("MarkStartTime").value;
    var MarkEndTime=document.getElementById("MarkEndTime").value;
    
    if(floatOrIntCheck(MarkStartTime) && floatOrIntCheck(MarkEndTime)){  //检验是否是小数或整数
        if(effectiveRange(MarkStartTime,MarkEndTime,rangeHS,rangeHE)){  //检验是否满足范围
           _addMarkInformation();  //添加标记
        }else{
           alert("范围必须是"+rangeHS+"~"+rangeHE+"并且开始时间小于结束时间");  
        }
    }else{
        alert("输入的值必须是小数或整数");
    }
}

/*设置当前位置数据有效性检验*/
var _placeDataCheck=function(){
    var rangeHS=parseFloat(document.getElementById("rangeHS").innerHTML);  //横坐标开始位置
    var rangeHE=parseFloat(document.getElementById("rangeHE").innerHTML);  //横坐标结束位置
    var setPlace=document.getElementById("setPlace").value;
    if(!setPlace.match("^[0-9]+([.]{0,1}[0-9]+){0,1}$") || setPlace>rangeHE || setPlace<rangeHS){
        alert("所设置的位置范围必须是"+rangeHS+"~"+rangeHE);
    }else{
        _setPlace();  //设置位置
    }
}  

/*GramCursor选区数据有效性检验*/
var _selectDataCheck=function(){
    var rangeHS=parseFloat(document.getElementById("rangeHS").innerHTML);  //横坐标开始位置
    var rangeHE=parseFloat(document.getElementById("rangeHE").innerHTML);  //横坐标结束位置
    var selectStart=document.getElementById("selectStart").value;
    var selectEnd=document.getElementById("selectEnd").value;

    if(floatOrIntCheck(selectStart) && floatOrIntCheck(selectEnd)){  //检验是否是小数或整数
        if(effectiveRange(selectStart,selectEnd,rangeHS,rangeHE)){  //检验是否满足范围
           _setSelection();//开始选区
        }else{
           alert("范围必须是"+rangeHS+"~"+rangeHE+"并且开始时间小于结束时间");  
        }
    }else{
       alert("输入的值必须是小数或整数");  
    }
}

/*是否是小数或整数检验*/
var floatOrIntCheck=function(checkData){
    if(checkData.match("^[0-9]+([.]{0,1}[0-9]+){0,1}$")){
        return true;
    }
}

/*是否是有效范围检验*/
var effectiveRange=function(selectStart,selectEnd,rangeHS,rangeHE){
    var floatSelectStart=parseFloat(selectStart);
    var floatSelectEnd=parseFloat(selectEnd);

    if(floatSelectStart>rangeHS && floatSelectEnd<rangeHE && floatSelectStart<floatSelectEnd){
       return true;
    }
    return false;
}



