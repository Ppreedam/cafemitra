"""Copy the Supabase (production) database into the local Postgres for testing.

    python scripts/sync_supabase_to_local.py

- Source: DATABASE_URL in .env (Supabase). Only READ from (pg_dump).
- Target: DATABASE_URL in .env.local (local Postgres). That database is
  DROPPED and recreated, then `manage.py migrate` applies any newer local
  migrations on top of production's schema.
- The dump is kept in backups/ (gitignored) - it contains real customer data,
  never commit or share it.
"""

import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent.parent
PG_BIN = Path(os.getenv("PG_BIN", r"C:\Program Files\PostgreSQL\18\bin"))
LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1"}


def read_env_value(path, key):
    if not path.exists():
        return ""
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line.startswith(f"{key}="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


def pg_tool(name):
    exe = PG_BIN / f"{name}.exe"
    return str(exe) if exe.exists() else name


def main():
    source_url = read_env_value(BASE_DIR / ".env", "DATABASE_URL")
    target_url = read_env_value(BASE_DIR / ".env.local", "DATABASE_URL")
    if not source_url or not target_url:
        sys.exit("DATABASE_URL must be set in both .env (Supabase) and .env.local (local Postgres).")

    target = urlparse(target_url)
    if target.hostname not in LOCAL_HOSTS:
        sys.exit(f"Refusing to overwrite non-local database host '{target.hostname}'.")
    source = urlparse(source_url)
    if source.hostname in LOCAL_HOSTS:
        sys.exit(".env DATABASE_URL points at localhost - expected the Supabase URL there.")

    db_name = target.path.lstrip("/")
    local_env = {
        **os.environ,
        "PGHOST": target.hostname,
        "PGPORT": str(target.port or 5432),
        "PGUSER": unquote(target.username or "postgres"),
        "PGPASSWORD": unquote(target.password or ""),
    }

    backups = BASE_DIR / "backups"
    backups.mkdir(exist_ok=True)
    dump_path = backups / f"supabase_public_{datetime.now():%Y%m%d_%H%M%S}.dump"

    sslmode = "&sslmode=require" if "?" in source_url else "?sslmode=require"
    print(f"1/4 Dumping Supabase public schema -> {dump_path.name} (read-only)...")
    subprocess.run(
        [pg_tool("pg_dump"), source_url + sslmode, "--schema=public", "--no-owner", "--no-privileges", "--format=custom", "-f", str(dump_path)],
        check=True,
    )

    print(f"2/4 Recreating local database '{db_name}'...")
    psql = [pg_tool("psql"), "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c"]
    subprocess.run(psql + [f'DROP DATABASE IF EXISTS "{db_name}" WITH (FORCE);'], check=True, env=local_env)
    subprocess.run(psql + [f'CREATE DATABASE "{db_name}";'], check=True, env=local_env)

    print("3/4 Restoring into local database...")
    # Supabase-only roles/policies (anon, authenticated...) don't exist
    # locally; pg_restore reports those and carries on with everything else.
    restore = subprocess.run(
        [pg_tool("pg_restore"), "-d", db_name, "--no-owner", "--no-privileges", str(dump_path)],
        env=local_env,
    )
    if restore.returncode != 0:
        print("   pg_restore reported some errors (usually Supabase-only roles/policies) - check output above.")

    print("4/4 Applying newer local migrations...")
    subprocess.run([sys.executable, "manage.py", "migrate"], check=True, cwd=BASE_DIR)
    print("Done. Local database now has a copy of Supabase data.")


if __name__ == "__main__":
    main()
