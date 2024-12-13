import os


class Config:
    PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(PROJECT_DIR, 'data')
    RANGES_FILE = os.path.join(DATA_DIR, 'ranges.json')

    @classmethod
    def ensure_data_dir_exists(cls):
        if not os.path.exists(cls.DATA_DIR):
            os.makedirs(cls.DATA_DIR)
