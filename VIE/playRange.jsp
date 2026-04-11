<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>测听页面</title>
		<style>*{margin: 0; padding: 0;}
		</style>
		<%
			String scheme = request.getScheme();
			String serverName = request.getServerName();
			int port = request.getServerPort();
			String url = scheme + "://" + serverName + ":"+ port;
			String callId =request.getParameter("callId");
			String voiceId =request.getParameter("voiceId");
		%>
	</head>
	<body>
		<div id="silverlightControlHost">
		    <object data="data:application/x-silverlight-2," id="silverlightCtrl" type="application/x-silverlight-2" width="100%" height="100%">
		        <param name="source" value="Third/Saluse.MediaKit.Sample.xap" />
		        <param name="maxframerate" value="30" />
		        <param name="onError" value="onSilverlightError" />
		        <param name="background" value="white" />
				<%
					if(callId!=null){
				%>
		        <param name="InitParams" value="res=<%=url %>${pageContext.request.contextPath}/player/getAudioClipsInfo?callId=<%=request.getParameter("callId")%>&voiceId=<%=request.getParameter("voiceId")%>&begin=<%=request.getParameter("begin")%>&end=<%=request.getParameter("end")%>&duration=<%=request.getParameter("duration")%>&channel=<%=request.getParameter("channel")%>,Wav_Channels=<%=request.getParameter("channel")%>,width=800,style=FULL,autogain=false,DownloadCache=80000,rulekeys1=您好" />
				<%
					}else{
				%>
				<param name="InitParams" value="res=<%=url %>${pageContext.request.contextPath}/player/getAudioClipsInfo?voiceId=<%=request.getParameter("voiceId")%>&begin=<%=request.getParameter("begin")%>&end=<%=request.getParameter("end")%>&duration=<%=request.getParameter("duration")%>&channel=<%=request.getParameter("channel")%>,Wav_Channels=<%=request.getParameter("channel")%>,width=800,style=FULL,autogain=false,DownloadCache=80000,rulekeys1=您好" />
				<%
				}
				%>
		        <param name="minRuntimeVersion" value="3.0.40818.0" />
		        <param name="autoUpgrade" value="true" />
		        <param name="Windowless" value="false" />
		        <a href="http://go.microsoft.com/fwlink/?LinkID=149156&v=3.0.40818.0" style="text-decoration: none">
		            <img src="http://go.microsoft.com/fwlink/?LinkId=161376" alt="Get Microsoft Silverlight" style="border-style: none" />
		        </a>
		    </object>
		</div>
		<script src="js/jquery.min.js"></script>
		<script src="js/Silverlight.js"></script>
		<script>
			function setPlayerHeigth(height){
				$('#silverlightControlHost').height(height)
				$(top.document).find('#listener_iframe').height(height+10);
			}
			
			function playRange(start,end){
				var slt = document.getElementById("silverlightCtrl");
				if (slt) {
				    try {
				        slt.Content.Page.playRangeScript(start, end);
				    } catch (e) {}
		   		}
			}
		</script>
	</body>
</html>
