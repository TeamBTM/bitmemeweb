FROM cosmwasm/workspace-optimizer:0.12.13

WORKDIR /code
COPY . /code/

RUN --mount=type=cache,target=/code/target \
    --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    optimize.sh