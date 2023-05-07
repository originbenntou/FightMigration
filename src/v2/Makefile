ENV?=dev
AWS_ACCOUNT=${AWS_ACCOUNT_ENV}
AWS_PROFILE:=${AWS_PROFILE_ENV}
AWS_REGION?=ap-northeast-1
#AWS_REPOSITORY:=fight-migration-v1
AWS_REPOSITORY:=fight-migration-v2
TAG:=$(shell git rev-parse --short HEAD)
PWD:=$(shell pwd)


.PHONY: $(shell egrep -o ^[a-zA-Z_-]+: $(MAKEFILE_LIST) | sed 's/://')
build:
	docker build -t $(AWS_REPOSITORY) . --platform=linux/amd64

tag:
	echo $(TAG)
	docker tag $(AWS_REPOSITORY) $(AWS_ACCOUNT).dkr.ecr.$(AWS_REGION).amazonaws.com/$(AWS_REPOSITORY):$(TAG)
	docker tag $(AWS_REPOSITORY) $(AWS_ACCOUNT).dkr.ecr.$(AWS_REGION).amazonaws.com/$(AWS_REPOSITORY):latest

login:
	aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) | docker login --username AWS --password-stdin $(AWS_ACCOUNT).dkr.ecr.$(AWS_REGION).amazonaws.com/$(AWS_REPOSITORY)

push:
	docker push $(AWS_ACCOUNT).dkr.ecr.$(AWS_REGION).amazonaws.com/$(AWS_REPOSITORY):$(TAG)
	docker push $(AWS_ACCOUNT).dkr.ecr.$(AWS_REGION).amazonaws.com/$(AWS_REPOSITORY):latest

run:
	docker run -it $(AWS_ACCOUNT).dkr.ecr.$(AWS_REGION).amazonaws.com/$(AWS_REPOSITORY):$(TAG)
