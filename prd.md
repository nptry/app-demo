

基于智慧灯杆的智慧城市解决方案
Smart Light Pole-Based Smart City Solutions




目 录
1	项目背景 Project Background	1
2	总体需求 Overall Requirements	2
2.1	重点区域人群管控 Crowd Management and Control in Key Areas	2
2.2	重点交通卡口监测 Monitoring at Key Traffic Checkpoints	3
2.3	重点行人通道监测 Monitoring at Key Pedestrian Passageways	5
2.4	综合治理数据源 Data Sources for Comprehensive Governance	6
2.5	运维需求 Operation and Maintenance Requirements	6
3	总体架构 Overall Architecture	8
3.1	应用架构 Application Architecture	8
3.2	功能架构 Functional Architecture	10
4	主要功能 Key Features	11
4.1	用户管理 User Management	11
4.2	设备管理 Device Management	12
4.3	运维管理 Operations and Maintenance	12
4.4	重要场所人群管理 Crowd Management in Important Venues	13
4.5	交通卡口管理 Traffic Checkpoints	14
4.6	行人通道管理 Pedestrian Passageways	16
4.7	消息机制 Message Mechanism	17
4.8	综合可视化 Visualized Comprehensive Display	18
4.9	对外服务接口 External Service Interfaces	18
5	建设内容 Implementation Content	20
6	项目概算 Project Budget	23




1项目背景 Project Background
尼日利亚的智慧城市建设处于试点探索与技术验证阶段，以部分大型基建项目和城市局部智能化建设为突破口，逐步推进智慧能源、智慧交通、智慧治理等框架和基础平台，逐步推进从示范项目到规模化推广。
Nigeria's smart city construction is currently in the pilot exploration and technical validation phase. By leveraging large-scale infrastructure projects and localized smart city initiatives as breakthrough points, it is progressively advancing frameworks and foundational platforms for smart energy, smart transportation, and smart governance, while driving the transition from demonstration projects to large-scale deployment.
本项目以智慧灯杆建设为基础，通过对智慧灯杆的AI赋能，增加高清智能摄像头、AI边缘计算设备和无线通信设备，充分利用智慧灯杆同步解决感知层设备的供电、安装位置等问题，将智慧灯杆作为智慧城市感知层的重要组成部分，避免重复建设，充分保护投资，成为智慧交通、智慧治理等智慧城市的组成部分和有益探索。
 This project is rooted in the construction of smart lamp posts. By equipping these lamp posts with AI capabilities, it integrates high-definition smart cameras, AI edge computing devices, and wireless communication equipment. Leveraging the smart lamp posts as a shared infrastructure, it simultaneously addresses critical challenges for perception layer devices - including power supply and installation location planning - thereby avoiding duplicate construction and safeguarding investments. As a key component of the smart city perception layer, these lamp posts serve as both an integral part of smart transportation, smart governance, and other smart city domains, and a valuable exploration in advancing urban intelligence.


2总体需求 Overall Requirements
本项目以智慧灯杆AI赋能为基础，在重点区域、重点交通卡口、重点行人通道实现自动数据采集、结构化分析、基于AI的应用，满足基于视频结构化分析、人脸识别、人群行为监测、车牌识别、交通流量监测、典型违章行为等的智慧交通、智慧治理需求，作为智慧城市建设的有益尝试。
This project, grounded in AI-enabled smart lamp posts, will deploy automatic data collection, structured analysis, and AI-driven applications across key zones, critical traffic checkpoints, and major pedestrian passageways. It is designed to address the demands of smart transportation​ and smart governance - capabilities rooted in video structural analysis, facial recognition, crowd behavior monitoring, license plate recognition, traffic flow tracking, and typical violation detection - while serving as a valuable exploration​ in the construction of smart cities.
主要满足以下需求：
Primarily meet the following requirements:

2.1重点区域人群管控 Crowd Management and Control in Key Areas
在重点区域的人群管控中满足以下需求：
（1）满足重点公共场所、活动区域对人群的自动化监测需求；
（2）满足对重点区域的管理需求，实现对重点区域基础信息、区域部署的设备管理、管理人员及权限管理等基础管理功能；
（3）满足对重点区域中停留人群的自动计数；
（4）满足对重点区域人群密度及变化趋势的统计分析和可视化呈现；
（5）满足在人群密度超限时的自动告警需求；
（6）满足对重点区域人流的自动监测；
（7）满足在重点区域人流异常时的自动告警需求；
（8）通过对人群密度、人流异常的统计、分析，为重点区域人群控制、人流规划等提供数据支撑；
（9）可扩展基于人脸识别的黑名单、重点人员监测及异常告警。


To address the following requirements in crowd management for key areas:
(1)Fulfill the need for automated crowd monitoring​ in key public spaces and event zones.
(2)Meet management requirements for key areas, enabling basic management functions such as: Basic information management of key areas; Equipment management for devices deployed in the area; Personnel and permission management.
(3)Support automatic counting​ of lingering crowds in key areas.
(4)Enable statistical analysis and visualized presentation​ of crowd density and its changing trends in key areas.
(5)Trigger automatic alarms​ when crowd density exceeds predefined limits.
(6)Fulfill the need for automated monitoring​ of pedestrian flow in key areas.
(7)Trigger automatic alarms​ for abnormal pedestrian flow (e.g., congestion, sudden surges) in key areas.
(8)Provide data support​ for crowd control strategies and pedestrian flow planning in key areas, based on statistics and analysis of crowd density and abnormal flow.
(9)Be extensible​ to support face recognition-based features: blacklist monitoring, key personnel tracking, and abnormal behavior alerts.

2.2重点交通卡口监测 Monitoring at Key Traffic Checkpoints
通过对重点交通卡口建设的智慧灯杆AI赋能，满足对重点交通卡口的以下管理需求：
（1）满足对重点交通卡口的管理需求，实现对卡口基础信息、地理位置、所部署的设备管理等基础管理功能；
（2）满足对卡口管控类型的管理需求，包括：流量监测卡口、车牌采集卡口、违反信号灯行驶卡口、逆行卡口、违停管理区域等；
（3）在满足对通行车辆计数、车牌自动识别需求的基础上，满足对车辆逆行、不按信号灯行驶、违规停车等违规行为的自动化发现、留痕和告警等需求；
（4）满足对重点卡口的车流计数，对车流量的实时情况、变化情况进行可视化呈现；
（5）满足对通过重点卡口的车辆牌号进行自动识别和记录，可扩展对车辆颜色、车型的自动识别，记录车辆多个特征；
（6）在单行道、高速匝道及其它单向行驶场景，满足对逆行车辆的自动识别和事件记录需求；
（7）满足对重要路口违反红绿灯行驶的自动识别和事件记录需求；
（8）满足对重点禁停、禁止通行区域的自动识别和事件记录需求。
By leveraging AI-enabled smart lamp posts​ at key traffic checkpoints, the following management requirements for these checkpoints are addressed:
(1)Fulfill basic management needs for key traffic checkpoints, enabling functions such as: Management of basic checkpoint information (e.g., name, purpose); Geographical location tracking; Deployed equipment (e.g., cameras, sensors) inventory and status monitoring.
(2)Support management of checkpoint control types, including: Traffic flow monitoring checkpoints; License plate capture checkpoints; Red-light violation checkpoints; Wrong-way driving checkpoints; Illegal parking management zones.
(3)On top of meeting requirements for passing vehicle counting​ and automatic license plate recognition (ALPR), enable automated detection, logging, and alarm triggering for violations such as: Wrong-way driving; Red-light running; Illegal parking.
(4)Provide vehicle flow counting​ for key checkpoints, along with visualized presentation of real-time traffic volume and trend changes.
(5)Automatically recognize and record vehicle license plates passing through key checkpoints. The system should be extensible​ to support automatic recognition of vehicle color and model, enabling recording of multiple vehicle features.
(6)In one-way streets, highway ramps, and other one-way traffic scenarios, fulfill requirements for automatic recognition and event logging​ of wrong-way vehicles.
(7)Enable automatic detection and event logging​ of red-light violations at key intersections.
(8)Support automatic detection and event logging​ of violations in key no-stopping and no-entry zones.

2.3重点行人通道监测 Monitoring at Key Pedestrian Passageways
根据管理需求，在城市重点行人通道部署监测点，并满足以下需求：
（1）满足对重点行人通道的基础信息管理、设备管理等基础管理需求；
（2）对通过监测点人员进行自动采集和人脸识别；
（3）满足对通过监测点人员的日志记录和查询；
（4）支持对重点布控人员的自动化发现和告警；
（5）支持对重点人员行动轨迹的查询；
（6）可扩展支持以图搜图。
Based on management requirements, monitoring points are deployed at key pedestrian passages​ in the city to meet the following requirements:
(1)Fulfill basic management needs for key pedestrian passages, including basic information management​ and equipment management. 
(2)Automatically collect data and perform facial recognition​ on individuals passing through the monitoring points. 
(3)Support log recording and querying​ for individuals traversing the monitoring points. 
(4)Enable automatic detection and alarm triggering​ for key monitored personnel​ (e.g., persons of interest under surveillance). 
(5)Support querying of movement trajectories​ for key personnel. 
(6)Be extensible​ to support image-based search​ (e.g., searching for matching images by uploading a reference photo).
2.4综合治理数据源 Data Sources for Comprehensive Governance
为最大保护投资，实现资源共享，应将基于智慧灯杆的智慧城市建设成果向其他系统共享，将采集到的人员、车辆、异常事件等信息、数据共享给执法或综合治理系统，成为智慧城市其他应用的数据源，发挥更大的综合效益。
（1）建立综合数据仓库；
（2）形成接口体系，定义数据结构、接口标准，并支持升级；
（3）建立良好的数据共享和业务协同机制。
To maximize investment protection and achieve resource sharing, the outcomes of smart city development based on smart lampposts should be shared with other systems. Collected data and information—such as personnel, vehicle, and abnormal incident records—must be provided to law enforcement or comprehensive governance systems, transforming them into data sources for other smart city applications and unlocking greater combined benefits.
(1)Establish an integrated data warehouse.
(2)Develop a standardized interface system: define data structures, interface protocols, and ensure scalability for future upgrades;
(3)Build a sound data sharing and business collaboration mechanism.

2.5运维需求 Operation and Maintenance Requirements
为更好整合资源，应满足智慧灯杆与智慧城市管理系统的最大无故障运行时间、可用性、可靠性等，将智慧灯杆与AI组件运维进行整合，满足以下需求：
（1）打造扎实的运维基础体系，实现对基础信息的细致管理，包括：区域/卡口定义、位置、设施设备等基础设施管理；
（2）满足对运维资源的管理需求，及时掌握可调配运维资源，包括车辆、人员、配件等；
（3）及时发现、预判故障，满足对故障的及时响应和排查需求；
（4）满足对故障事件的生成、派发、处置和结果跟踪的需求；
（5）建立远程运维监测、远程故障排查和软件故障处置的需求；
（6）满足对故障日志的记录、故障发生率及变化情况、处置效率等的综合管理需求 。
To better integrate resources, smart lampposts and the smart city management system must meet requirements for maximum uptime without failure, availability, and reliability. Integrate the operation and maintenance (O&M) of smart lampposts and AI components to fulfill the following:
(1)Build a robust O&M foundation system to enable detailed management of basic information - including core infrastructure such as regional/checkpoint definitions, locations, and facilities/equipment.
(2)Address management needs for O&M resources to ensure timely access to deployable assets (e.g., vehicles, personnel, spare parts).
(3)Enable timely fault detection and prediction to meet requirements for rapid response and troubleshooting.
(4)Support the full lifecycle of fault incidents: generation, dispatch, handling, and result tracking.
(5)Establish requirements for remote O&M monitoring, remote fault troubleshooting, and software fault resolution.
(6)Fulfill comprehensive management needs for fault log recording, analysis of fault occurrence rates/trends, and evaluation of handling efficiency.



3总体架构 Overall Architecture
3.1应用架构 Application Architecture
本项目总体应用架构如下图所示：
The overall application architecture of this project is illustrated in the diagram below:

Figure 4-1 Overall Application Architecture Diagram

通过对智慧灯杆的AI赋能，构建系统感知层，主要包括：高清数字化摄像机、AI边缘计算终端。
AI边缘计算终端连接4G无线终端作为网络接入，通过运营商4G网络将采集到的图片、结构化分析数据传输至云服务器集群。
通过物联网服务器管理各类感知层设备和远程终端，在实现图片、结构化数据传输的同时，实现对各类远程终端的管理。
根据重点区域、道路交通卡口、行人通道监测点管理需求，由云服务器集群实现各种功能并实现数据的持久化存储。
管理人员、业务人员、远程工作人员通过互联网或VPN，在应用服务支持下完成各类管理工作。
通过接口服务器，向外部业务提供业务协同和数据共享。

System Overview of Smart Lamp Post with AI Empowerment. The smart lamp post system integrates AI capabilities to establish a comprehensive perception layer, primarily consisting of: High - definition digital cameras, AI edge computing terminals.
AI Edge Terminals connect to 4G wireless terminals for network access.
Collected data (images, structured analytics results) is transmitted via the 4G network to the Cloud Server Cluster.
IoT Server centrally manages all perception - layer devices (e.g., cameras, edge terminals) and remote terminals.
It enables real - time data transmission while monitoring device status and lifecycle.
The Cloud Server Cluster delivers core functionalities and ensures persistent data storage in the database, covering: Traffic flow analysis, Pedestrian behavior recognition, Incident detection records.
Administrators, business staff, and remote users access the system through: Internet or VPN.
Application Servers (providing business logic interfaces like user management and alert push).
Interface Server facilitates: Cross - system data sharing (e.g., with traffic command centers, municipal platforms), Real - time event notifications via standardized APIs.



3.2功能架构 Functional Architecture
本项目总体功能架构如下图所示：
The overall functional architecture of this project is shown in the figure below:


Figure 4-2 Overall functional architecture Diagram


4主要功能 Key Features
4.1用户管理 User Management
实现对平台权限、角色、用户等的统一管理。
根据各项功能的权限管控需求，设置多种管理、使用权限；结合用户单位组织架构和分工，设置不同的角色，实现对各类管理、使用角色的预置。
根据用户的岗位及对应的权限，为用户分配平台账号，实现对账号的添加、修改、禁用、删除等功能。
管理账号名、用户实名、所在单位、部门、岗位、电话及邮箱等详细信息，方便对平台用户的细致管理。
用户使用自己的账号及动态验证码，即可通过Web或移动终端登录并在权限管理约束下使用平台对应功能。
为进一步加强管理和控制，对用户的登录、操作日志进行记录，以便对平台用户的行为进行追溯和审计。

Figure 5-1 User management Function
Enable unified management of platform permissions, roles, and users.
Based on the permission control requirements of each function, configure multiple administrative and operational permissions; combined with the organizational structure and division of labor of the user’s organization, set up different roles to preset various administrative and operational roles.
Assign platform accounts to users based on their positions and corresponding permissions, enabling functions such as adding, modifying, disabling, and deleting accounts.
Manage detailed information including account names, real names, organizations, departments, positions, phone numbers, and emails to facilitate granular management of platform users.
Users can log in via Web or mobile terminals and access the platform’s corresponding functions within the bounds of permission management using their own accounts and dynamic verification codes.
To further strengthen governance and control, log users’ login and operation activities to enable traceability and auditing of user behavior on the platform.

4.2设备管理 Device Management
实现对平台主要设备的管理，包括：AI边缘计算设备、4G无线网关设备。
实现设备名称、类型、规格型号、供应商等基础信息的管理。
实现设备应用类型（重点区域、交通卡口、人行通道等）、安装位置（包括地理位置信息）等应用信息的管理。
实现设备工作状态的实时监测。
Enable unified management of the platform’s key equipment, including AI edge computing devices and 4G wireless gateway devices.
Manage the basic information of devices, including name, type, specifications and models, and suppliers.
Manage application-related information of devices, including application types (e.g., key areas, traffic checkpoints, pedestrian passageways) and installation locations (including geographical location data).
Enable real-time monitoring of devices’ operating status.

4.3运维管理 Operations and Maintenance
实现对平台主要设备和基础网络的运维管理。
及时掌握设备的工作状态，判断可能出现的故障，生成故障处置工单，由运维技术人员及时进行远程或现场处置，并填报故障处置情况及结果，对故障的发生、处置、结果进行全过程跟踪，以提高故障排查、处置效率，最大提高系统的无故障工作时间。
同时，监测4G无线网关和云服务平台的网络连接情况，及时发现网络故障并根据故障处置流程进行故障排除并记录处置情况。

Enable Operations and Maintenance (O&M) management of the platform’s key equipment and underlying network.
Monitor the real-time operating status of equipment to identify potential failures, generate fault handling work orders, which O&M technicians address promptly - either remotely or on-site - and submit handling details and outcomes. Track the entire fault lifecycle (occurrence, handling, resolution) to boost fault diagnosis and resolution efficiency and maximize system uptime.
Meanwhile, monitor the network connectivity of 4G wireless gateways and cloud service platforms, promptly detect network faults, troubleshoot per established fault handling procedures, and log all handling details.

4.4重要场所人群管理 Crowd Management in Important Venues
在需要做监测的重点场所，部署高清数字摄像机作为数据采集终端，部署AI边缘计算终端实现视频结构化分析，实现以下功能：
（1）对重点场所基础信息进行管理，包括：场所名称、地理位置、现场平面图、场所类型、场所描述、负责人等
（2）对场所所部署的设备进行管理，包括：摄像机、安装位置、AI边缘计算设备及4G无线网关等；
（3）对场所进行监测区域划分，50㎡~80㎡一个区域，每个区域部署1台高清摄像机负责视频采集；
（4）在AI边缘计算终端部署人员密度监测算法，对区域人员密度数据进行自动化分析，并实现实时人员密度可视化呈现、区域人员密度变化趋势呈现以及人员密度异常变化告警；
（5）在AI边缘计算终端部署人流监测算法，对区域人流情况进行自动化监测，如：主要人流方向为东西；对人流异常变化进行告警，并对人流情况进行可视化呈现；
（6）告警信息通过消息机制通过短信等形式及时推送给区域负责人，以便对快速完成对异常情况的核查和处置；
（7）可扩展在重要场所对重点人员（黑名单）人员的发现和告警。

In key monitoring venues requiring surveillance, deploy high-definition digital cameras as data collection terminals and AI edge computing terminals for video structured analysis, enabling the following functions:
(1) Basic Venue Information Management: Manage core details of key venues, including venue name, geographical location, on-site floor plan, venue type, venue description, and responsible person.
(2) Deployed Equipment Management: Manage equipment installed at the venue, including cameras, their installation locations, AI edge computing devices, and 4G wireless gateways.
(3) Monitoring Zone Partitioning: Divide the venue into monitoring zones (50–80㎡ per zone), with one high-definition camera deployed per zone to capture video.
(4) Crowd Density Monitoring: Deploy a crowd density monitoring algorithm on AI edge computing terminals to automate analysis of regional crowd density data. This supports real-time visualization of density levels, trend visualization of density changes, and alerts for abnormal fluctuations.
(5) Pedestrian Flow Monitoring: Deploy a pedestrian flow monitoring algorithm on AI edge computing terminals to automate tracking of regional pedestrian activity—e.g., identifying the main flow direction (east → west). It generates alerts for abnormal flow changes and visualizes pedestrian dynamics.
(6) Alert Notification: Alerts are promptly pushed to regional managers via messaging mechanisms (e.g., SMS), enabling rapid verification and handling of anomalies.
(7) Scalable Key Personnel Detection: The system can be extended to detect and alert on key personnel (e.g., blacklisted individuals) in important venues.

4.5交通卡口管理 Traffic Checkpoints
在重要交通卡口部署高清数字摄像机作为数据采集终端，部署AI边缘计算终端实现视频结构化分析，实现以下功能：
（1）对交通卡口类型的管理，包括：车流统计、车牌识别、闯红灯、逆行、违规停车等，一个卡口可同时属于多个类型；
（2）交通卡口详细信息管理，包括：卡口名称、地理位置、情况描述、电子地图、负责人等；
（3）交通卡口所部署的设备管理，包括：高清摄像机、AI边缘计算终端、4G无线网关等；
（4）根据交通卡口的不同类型，在AI边缘计算终端部车牌识别算法、交通流量分析算法、闯红灯监测算法、逆行分析算法、违规停车算法等，对卡口各类数据进行自动化分析，并实现车流量、违规行为等的可视化呈现，交通流量变化趋势呈现以及违规行为告警等；
（5）告警信息通过消息机制通过短信等形式及时推送给交通卡口负责人，以便对快速完成对异常情况的核查和处置；
（6）可扩展特殊车辆的发现和告警。
Deploy high-definition digital cameras as data collection terminals at key traffic checkpoints, and deploy AI Edge Computing Terminals to perform video structuring analysis - enabling the following functions:
(1) Management of traffic checkpoint types: Includes traffic volume statistics, license plate recognition, red-light violation monitoring, wrong-way driving detection, and illegal parking detection. A checkpoint can belong to multiple types simultaneously.
(2) Detailed information management of traffic checkpoints: Covers checkpoint name, geographical location, situation description, electronic map, and person in charge.
(3) Management of devices deployed at checkpoints: Includes high-definition cameras, AI Edge Computing Terminals, 4G wireless gateways, etc.
(4) Algorithm deployment and automated analysis: Based on different checkpoint types, deploy algorithms such as license plate recognition, traffic flow analysis, red-light monitoring, wrong-way driving analysis, and illegal parking onto the AI Edge Computing Terminals. This enables automated analysis of various checkpoint data, as well as visual presentation of traffic volume, violation behaviors, traffic flow trends, and alerts for violations.
(5) Alert notification: Alert information is promptly pushed to the checkpoint person in charge via the message mechanism(e.g., SMS), facilitating rapid verification and handling of anomalies.
(6) Scalability: Supports future expansion for detection and alerting of special vehicles.

4.6行人通道管理 Pedestrian Passageways
在重要人行通道路口或关键点位部署高清数字摄像机作为数据采集终端，部署AI边缘计算终端实现视频结构化分析，实现以下功能：
（1）人行通道管理点位详细信息管理，包括：点位名称、地理位置、情况描述、电子地图、负责人等；
（2）人行通道监测点位所部署的设备管理，包括：高清摄像机、AI边缘计算终端、4G无线网关等；
（3）在AI边缘计算终端部署人脸识别算法，对经过点位的人员进行人脸捕获并记录；
（4）可对经过点位的人员进行基于人脸的查询、区域范围的轨迹追踪；
（5）可扩展特殊人员的发现和告警。
Deploy high-definition digital cameras as data collection terminals at key pedestrian passage intersections or critical locations, and deploy AI Edge Computing Terminals for video structured analysis—enabling the following functions:
(1) Detailed information management of pedestrian passage management points: Includes point name, geographical location, description, electronic map, and person in charge.
(2) Management of devices deployed at pedestrian passage monitoring points: Includes high-definition cameras, AI Edge Computing Terminals, 4G wireless gateways, etc.
(3) Facial recognition algorithm deployment on AI Edge Computing Terminals: Captures and records facial data of personnel passing through the points.
(4) Face-based querying and trajectory tracking: Supports face-based searches and trajectory tracking within specified areas for personnel passing through the points.
(5) Scalability: Supports future expansion for detection and alerting of special personnel.
根据人行通道对人脸捕获的特殊需求，所部署的摄像机安装位置应在2.5m~3m高度，依照以下公式计算：

镜头高度H≈行人平均身高(h)+视角补偿(α)
其中：h取：1.7m，α取：0.8~1.8m
H≈2.5m~3.5m

Based on the special requirements for facial capture in pedestrian passages, the installation height of the deployed cameras should be 2.5m–3m. Calculate using the following formula:
Lens height H≈Average pedestrian height h+Viewing angle compensation (α)
Where:
h = 1.7m (average pedestrian height)
α= 0.8m–1.8m (viewing angle compensation)
Thus, H ≈ 2.5m–3.5m

4.7消息机制 Message Mechanism
根据甲方所选择的服务商短信服务技术标准和接口，完成接口开发，并实现以下功能：
（1）各类异常、违规事件的短信的标准化定义；
（2）接口开发，实现相关事件通知短信及时发送给指定负责人；
（3）记录短信发送日志备查，包括：发送时间、内容、接收人等。
Complete the interface development based on the technical standards and interfaces of the SMS service provided by the service provider selected by Party A, to implement the following functions:
(1) Standardized definition of SMS messages for various anomalies and violations;
(2) Interface development to ensure timely sending of event notification SMS to the designated person in charge;
(3) Logging of SMS sending activities for reference, including: sending time, content, recipient, etc.
4.8综合可视化 Visualized Comprehensive Display
根据用户需求和使用习惯，开发统一综合可视化展示模块，实现以下功能：
（1）支持对设备部署情况以列表、电子地图形式展示；
（2）支持对设备的在线状态的展示、故障及处置情况的展示；
（3）按不同业务进行分类展示，如：重要区域、交通卡口、行人通道等；
（4）支持各监测区域、点位以列表形式展示；
（5）支持各监测区域、点位以电子地图形式展示（需电子地图支持）；
（6）支持对各类监测数据以列表形式展示，并对数据统计结果、变化趋势等进行多维图表展示，包括：分布、占比、变化趋势等；
（7）用户需要展示的其它数据。
Based on user requirements and usage habits, develop a unified comprehensive visualization module to achieve the following functions:
(1) Supports displaying device deployment status in the form of lists or electronic maps;
(2) Supports displaying the online status of devices, as well as fault status and handling progress;
(3) Supports classified display by different business types, e.g., key areas, traffic checkpoints, pedestrian passages, etc.;
(4) Supports displaying monitoring areas and points in list form;
(5) Supports displaying monitoring areas and points on electronic maps (requires support from the electronic map);
(6) Supports displaying various monitoring data in list form, and presents statistical results, trends, etc., of the data through multi-dimensional charts—including distribution, proportion, and trends;
(7) Other data that users need to display.

4.9对外服务接口 External Service Interfaces
为满足用户对数据共享、业务协同的需求，对外服务接口应实现以下功能：
（1）制定各类接口数据标准，包括：人员、车辆、异常事件、违规事件等；
（2）根据接口数据标准制定接口协议；
（3）制定接口安全策略，确保接入系统和数据传输安全；
（4）开发对外服务接口，通过消息机制或用户需要的其它方式开发接口服务，随时提供对外部系统的数据共享服务，及时接收回处理数据请求服务，为外部系统提供数据共享。
To meet users' requirements for data sharing and business collaboration, the external service interface shall implement the following functions:
(1) Define data standards for various interfaces, including: personnel, vehicles, anomalies, violations, etc.;
(2) Formulate interface protocols based on the defined interface data standards;
(3) Develop interface security policies to ensure the security of connected systems and data transmission;
(4) Develop external service interfaces—create interface services via the message mechanism or other methods required by users—to provide on-demand data sharing services to external systems, promptly receive and process data requests, and facilitate seamless data sharing with external systems.



5建设内容 Implementation Content
本项目主要建设内容如下表所示：
The main construction contents of this project are shown in the following table:
序号
SN	类别
Category	产品名称
Product	说明 Description
1	云平台
Cloud Platform	云服务器
Cloud Server	配置要求：8核32G， ubuntu24.04，500g存储
Configuration requirements: 8-core, 32GB RAM, Ubuntu 24.04, 500GB storage
2	基础设施
Infrastructure	智慧灯杆
Smart Lamp Post	作为智慧城市建设重要基础设施和载体，为摄像机、AI边缘计算终端、4G无线网关提供安装空间、供电等基础保障
As an important infrastructure and carrier for smart city construction, it provides basic support - including installation space, power supply, etc. - for cameras, AI Edge Computing Terminals, and 4G wireless gateways.
3	感知层
Perception Layer	高清数字摄像机
High-definition digital camera	≥400万像素，根据不同场景选择不同焦距，确保车牌识别区域、人脸识别区域的采样图片质量不低于200dpi
≥4 million pixels. Select different focal lengths based on different scenarios to ensure that the sampling image quality of the license plate recognition area and facial recognition area is no less than 200 dpi.
4	AI能力
AI Capabilities	AI边缘计算
AI Edge Computing	对摄像机提供的视频流进行结构化，集成满足平台需求的各类算法
支持远程运维管理
Structures the video streams provided by cameras, integrating various algorithms that meet platform requirements.
Supports remote operation and maintenance management.
5	通信
Communication	4G无线网关
4G Wireless Gateway	支持远程管理
Supports remote management
6	软件
Software	管理平台
Management Platform	支持基于智慧灯杆的智慧城市管理平台各项功能，包括：
(1)用户管理：权限、角色、账号和日志管理功能
(2)设备管理：设备基础信息、部署信息、电子地图（甲供）
(3)运维管理：远程检测、远程维护、远程升级、故障事件处置
(4)重点区域管理：区域详细信息管理、地理位置、部署设备管理、人员密度监测、人员密度异常告警、密度实时监测结果及趋势分析、可视化展示、重点人员监测及告警
(5)交通卡口管理：卡口详细信息管理、地理位置、电子地图（甲供）、车流量统计、流量趋势分析及可视化、车牌识别与记录、闯红灯事件监测及告警、单行道违章告警、禁停区域违停告警，告警发送；各类异常事件统计、分析及可视化呈现
(6)人行通道管理：人行通道监测点详细信息管理、地理位置、电子地图（甲供）、基于人脸识别的重点人员布控、重点人员出现告警、重点人员轨迹追踪
(7)消息机制：内部消息机制、手机短信推送
(8)接口机制：接口数据标准、接口协议及数据共享、业务协同服务
(9)综合可视化呈现
(10)移动应用：基于H5的手机应用，针对管理人员、运维人员权限和业务习惯提供对应的移动应用功能
上述软件为根据用户方需求订制开发，提供1年软件维护服务
满足4000个监测点位管理需求

Supports all functions of the Smart City Management Platform based on smart lamp posts, including:
(1)User Management: Functions for permission, role, account, and log management.
(2)Device Management: Basic device information, deployment information, and electronic map (supplied by Party A).
(3)Operation and Maintenance Management: Remote detection, remote maintenance, remote upgrade, and fault event handling.
(4)Key Area Management: Detailed area information management, geographical location, deployed device management, personnel density monitoring, abnormal personnel density alert, real-time density monitoring results and trend analysis, visual display, key personnel monitoring and alert.
(5)Traffic Checkpoint Management: Detailed checkpoint information management, geographical location, electronic map (supplied by Party A), traffic volume statistics, traffic trend analysis and visualization, license plate recognition and recording, red-light violation monitoring and alert, one-way road violation alert, no-parking zone violation alert, alert sending; as well as statistics, analysis, and visual presentation of various abnormal events.
(6)Pedestrian Passage Management: Detailed pedestrian passage monitoring point information management, geographical location, electronic map (supplied by Party A), key personnel deployment based on facial recognition, key personnel presence alert, and key personnel trajectory tracking.
(7)Message Mechanism: Internal message mechanism and mobile SMS push.
(8)Interface Mechanism: Interface data standards, interface protocols and data sharing, and business collaboration services.
(9)Comprehensive Visual Presentation.
(10)Mobile Application: An H5-based mobile application providing corresponding functions tailored to the permissions and business habits of management and operation and maintenance personnel.
The above software is custom-developed to meet user requirements and comes with 1 year of software maintenance services.
It meets the management needs of 4,000 monitoring points.
说明：
（1）上述2、3、4、5项按1:1配置，根据用户需求按4000套预估；
（2）上述1、6项为统一平台。
Explanation：
(1) The above Items 2, 3, 4, and 5 are configured in a 1:1 ratio, estimated at 4,000 sets based on user requirements;
(2) The above Items 1 and 6 constitute a unified platform.



6项目概算 Project Budget
另行提供。
Provided separately.

