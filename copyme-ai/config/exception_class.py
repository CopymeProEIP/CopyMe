class SettingsException(Exception):
    '''
        thrown an exception
    '''

    def __init__(self, message: str, errors: int = 1):
        # Call the base class constructor with the parameters it needs
        super().__init__(message)

        # Now for your custom code...
        self.errors = errors
        self.message = message