<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>测听页面</title>
    <style>* {
        margin: 0;
        padding: 0;
    }
    </style>
    <%
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int port = request.getServerPort();
        String url = scheme + "://" + serverName + ":" + port;
    %>
    <script src="js/jquery.min.js"></script>
    <script src="js/Silverlight.js"></script>
    <script>
        function setPlayerHeigth(height) {
            $('#silverlightControlHost').height(height)
            $(top.document).find('#listener_iframe').height(height + 10);
        }

        function playRange(start, end) {
            var slt = document.getElementById("silverlightCtrl");
            if (slt) {
                try {
                    slt.Content.Page.playRangeScript(start, end);
                } catch (e) {
                }
            }
        }
        $(function () {
            var url = '<%=url %>';
            var contextPath = '${pageContext.request.contextPath}';
            var pCallID = '<%=request.getParameter("taskId")%>';
            var pChanel = '<%=request.getParameter("channel")%>';
            var pWidth = '<%=request.getParameter("width")%>';
            var pContent = decodeURI('<%=request.getParameter("pContent")%>').replace("#","|");
            var pHeight = 1800;
            var urlParams = '<%=request.getParameter("urlParams")%>';
            var dataSource = '<%=request.getParameter("dataSource")%>';
            var voiceId = '<%=request.getParameter("voiceId")%>';
            var token = localStorage.getItem('h5-token')
            var res = url + contextPath + '/player/getFullAudioInfo?callId=' + voiceId+'&taskId='+pCallID + '&dataSource=' + dataSource + '&token=' + token;
            var html = '<object ' +
                    'data="data:application/x-silverlight-2," ' +
                    'type="application/x-silverlight-2" ' +
                    'id="silverlightCtrl"' +
                    'width="100%"  height="100%">' +
                    '<param name="source" value="Third/Saluse.MediaKit.Sample.xap">' +
                    '<param name="maxframerate" value="30">' +
                    '<param name="onError" value="onSilverlightError">' +
                    '<param name="background" value="white">' +
                    '<param name="InitParams" value="' +
                    'res=' + res +
                    ',width=' + 796 + ',Wav_Channels=' + pChanel + ',style=FULL' +
                    ',autogain=false,DownloadCache=80000,' +
                    (pContent ? ',rulekeys1=' + pContent : "") +
                    '">' +
                    '<param name="minRuntimeVersion" value="3.0.40818.0">' +
                    '<param name="autoUpgrade" value="true">' +
                    '<param name="windowless" value="false">' +
                    ' <param name="onLoad" value="silverlightLoaded" />' +
                    '</object>';
            $("#silverlightControlHost").append(html);
        });


    </script>
</head>
<body>
<div id="silverlightControlHost">
</div>
<script>


</script>
</body>
</html>
