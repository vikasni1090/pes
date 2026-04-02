#!/usr/bin/env bash

set -euo pipefail

COMPOSE_FILE="$(dirname "$0")/docker-compose.yml"

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> [options]

Commands:
  up        Build images and start all services (default: attached)
  down      Stop and remove containers
  restart   Tear down then bring back up
  logs      Follow logs for all services (or a specific one)
  status    Show running container status
  clean     Stop containers and delete all volumes (WIPES DATABASE)

Options:
  -d, --detach      Run in background (applies to: up, restart)
  -v, --volumes     Also remove volumes (applies to: down)
  -s, --service     Target a specific service: backend | frontend | mongo
  -h, --help        Show this help message

Examples:
  $(basename "$0") up
  $(basename "$0") up -d
  $(basename "$0") up -d -s backend
  $(basename "$0") down
  $(basename "$0") down -v
  $(basename "$0") restart -d
  $(basename "$0") logs -s backend
  $(basename "$0") clean
EOF
  exit 0
}

# ── defaults ──────────────────────────────────────────────────────────────────
COMMAND=""
DETACH=false
REMOVE_VOLUMES=false
SERVICE=""

# ── parse args ────────────────────────────────────────────────────────────────
[[ $# -eq 0 ]] && usage

COMMAND="$1"
shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--detach)    DETACH=true      ;;
    -v|--volumes)   REMOVE_VOLUMES=true ;;
    -s|--service)   SERVICE="$2"; shift ;;
    -h|--help)      usage ;;
    *) echo "Unknown option: $1" >&2; usage ;;
  esac
  shift
done

# ── helpers ───────────────────────────────────────────────────────────────────
compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

# ── commands ──────────────────────────────────────────────────────────────────
case "$COMMAND" in
  up)
    echo "==> Building and starting services..."
    ARGS=(up --build)
    [[ "$DETACH"  == true ]] && ARGS+=(-d)
    [[ -n "$SERVICE" ]]      && ARGS+=("$SERVICE")
    compose "${ARGS[@]}"
    ;;

  down)
    echo "==> Stopping and removing containers..."
    ARGS=(down)
    [[ "$REMOVE_VOLUMES" == true ]] && ARGS+=(--volumes)
    [[ -n "$SERVICE" ]]             && { echo "Error: 'down' does not support --service." >&2; exit 1; }
    compose "${ARGS[@]}"
    ;;

  restart)
    echo "==> Restarting services..."
    ARGS=(down)
    compose "${ARGS[@]}"
    ARGS=(up --build)
    [[ "$DETACH"  == true ]] && ARGS+=(-d)
    [[ -n "$SERVICE" ]]      && ARGS+=("$SERVICE")
    compose "${ARGS[@]}"
    ;;

  logs)
    ARGS=(logs -f)
    [[ -n "$SERVICE" ]] && ARGS+=("$SERVICE")
    compose "${ARGS[@]}"
    ;;

  status)
    compose ps
    ;;

  clean)
    echo "WARNING: This will delete all containers and volumes, including the database."
    read -r -p "Are you sure? [y/N] " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
    echo "==> Tearing down everything..."
    compose down --volumes --remove-orphans
    ;;

  *)
    echo "Unknown command: $COMMAND" >&2
    usage
    ;;
esac
