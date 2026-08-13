import os
import sys
import threading

from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        # The rembg/onnxruntime model is ~176MB and takes many seconds to
        # load from disk on first use - without this, the first background-
        # removal request after a (re)start pays that cost with zero
        # progress feedback in the UI, which looks like the feature is
        # broken/stuck rather than just slow. Warm it in a background
        # thread at server startup instead, so the first real request is
        # already fast.
        if "runserver" in sys.argv and os.environ.get("RUN_MAIN") != "true":
            return  # dev autoreload watcher process - never serves requests
        if "manage.py" in sys.argv[0] and "runserver" not in sys.argv:
            return  # migrate/shell/test/etc. - no need to load the model
        threading.Thread(target=self._warm_background_remover, daemon=True).start()

    @staticmethod
    def _warm_background_remover():
        try:
            from .background_remover.remove_background import _get_session

            _get_session()
        except Exception:
            pass
