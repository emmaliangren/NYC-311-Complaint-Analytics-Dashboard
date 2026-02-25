.PHONY: help \
	up down build restart logs ps \
	prune clean nuke \
	test test-frontend test-backend test-ingestor \
	lint lint-frontend lint-backend lint-ingestor \
	ci ci-frontend ci-backend ci-ingestor \
	deploy deploy-up deploy-down deploy-build deploy-restart deploy-logs deploy-ps deploy-clean deploy-nuke

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "  up             docker compose up -d"
	@echo "  down           docker compose down"
	@echo "  build          docker compose up --build -d"
	@echo "  restart        docker compose restart"
	@echo "  logs           docker compose logs -f"
	@echo "  ps             docker compose ps"
	@echo ""
	@echo "  prune          docker system prune -f"
	@echo "  clean          docker compose down -v --remove-orphans"
	@echo "  nuke           docker compose down -v --remove-orphans --rmi all"
	@echo ""
	@echo "  test           run all tests"
	@echo "  test-frontend  run frontend tests"
	@echo "  test-backend   run backend tests"
	@echo "  test-ingestor  run ingestor tests"
	@echo ""
	@echo "  lint           lint all services"
	@echo "  lint-frontend  lint frontend"
	@echo "  lint-backend   lint backend"
	@echo "  lint-ingestor  lint ingestor"
	@echo ""
	@echo "  ci             run full ci check (lint + test)"
	@echo "  ci-frontend    ci check frontend"
	@echo "  ci-backend     ci check backend"
	@echo "  ci-ingestor    ci check ingestor"
	@echo ""
	@echo "  deploy         build and start production stack"
	@echo "  deploy-up      start production stack (no build)"
	@echo "  deploy-down    stop production stack"
	@echo "  deploy-build   rebuild and restart production stack"
	@echo "  deploy-restart restart production stack"
	@echo "  deploy-logs    tail production logs"
	@echo "  deploy-ps      show production container status"
	@echo "  deploy-clean   stop production stack and remove volumes"
	@echo "  deploy-nuke    stop production stack, remove volumes and images"
	@echo ""
	@echo "  deploy-files   build files location"
	@echo ""
up:
	docker compose up -d
down:
	docker compose down
build:
	docker compose up --build -d
restart:
	docker compose restart
logs:
	docker compose logs -f
ps:
	docker compose ps
prune:
	docker system prune -f
clean:
	docker compose down -v --remove-orphans
nuke:
	docker compose down -v --remove-orphans --rmi all
test: test-frontend test-backend test-ingestor
test-frontend:
	docker compose exec frontend npm test
test-backend:
	docker compose exec backend ./gradlew test
test-ingestor:
	docker compose exec ingestor pytest
lint: lint-frontend lint-backend lint-ingestor
lint-frontend:
	docker compose exec frontend npm run lint
lint-backend:
	docker compose exec backend ./gradlew checkstyleMain
lint-ingestor:
	docker compose exec ingestor black --check .
ci: ci-frontend ci-backend ci-ingestor
ci-frontend:
	docker compose run --rm frontend sh -c "npm ci && npm run ci"
ci-backend:
	docker compose exec backend ./gradlew check
ci-ingestor:
	docker compose exec ingestor sh -c "git diff --exit-code || black .; pytest"
deploy:
	docker compose -f docker-compose.deploy.yml up --build -d
deploy-up:
	docker compose -f docker-compose.deploy.yml up -d
deploy-down:
	docker compose -f docker-compose.deploy.yml down
deploy-build:
	docker compose -f docker-compose.deploy.yml up --build -d
deploy-restart:
	docker compose -f docker-compose.deploy.yml restart
deploy-logs:
	docker compose -f docker-compose.deploy.yml logs -f
deploy-ps:
	docker compose -f docker-compose.deploy.yml ps
deploy-clean:
	docker compose -f docker-compose.deploy.yml down -v --remove-orphans
deploy-nuke:
	docker compose -f docker-compose.deploy.yml down -v --remove-orphans --rmi all
deploy-files:
	cd frontend && npm run build && find build -type f | grep index.html
