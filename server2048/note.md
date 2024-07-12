my-multi-games-server/
|-- src/
|   |-- config/               # 存储测试环境和生产环境的配置
|   |   `-- config.dev.json
|   |-- controllers/          # 存储处理HTTP请求的控制器
|   |   `-- AuthController.ts
|   |-- core/                 # 核心文件，如服务器启动和配置
|   |   `-- server.ts         # 初始化并启动Colyseus服务器的逻辑
|   |-- games/                # 游戏逻辑，每个子目录代表一个游戏模块
|   |   |-- game1/
|   |   |   `-- Game1Room.ts  # 第一个游戏的房间定义和逻辑
|   |   |-- game2/
|   |       `-- Game2Room.ts  # 第二个游戏的房间定义和逻辑
|   |-- models/               # 数据模型
|   |   `-- UserModel.ts      # 用户数据模型
|   |-- services/             # 后端服务，如数据库操作、认证服务等。
|   |   `-- DatabaseService.ts
|   |-- utils/                # 辅助函数和工具类
|   |   |-- ErrorHandler.ts   # 错误处理工具
|   |   `-- Logger.ts         # 日志工具类
|   |-- index.ts              # 项目入口文件（保留create-colyseus-app提供的）
|   `-- app.config.ts         # 应用配置文件（保留create-colyseus-app提供的）
|-- .env                      # 环境变量配置
|-- tsconfig.json             # TypeScript配置文件
`-- package.json              # node包管理和脚本配置


//mongodb启动
mongod --config /opt/homebrew/etc/mongod.conf