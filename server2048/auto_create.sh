# 删除旧的rooms目录
rm -rf src/rooms

# 创建适应新结构的文件夹和文件
mkdir -p src/games/game1
mkdir -p src/games/game2
touch src/games/game1/Game1Room.ts
touch src/games/game2/Game2Room.ts

mkdir -p src/controllers
mkdir -p src/core
mkdir -p src/models
mkdir -p src/services
mkdir -p src/utils

touch src/controllers/AuthController.ts
touch src/core/server.ts
touch src/models/UserModel.ts
touch src/services/DatabaseService.ts
touch src/utils/ErrorHandler.ts
touch src/utils/Logger.ts