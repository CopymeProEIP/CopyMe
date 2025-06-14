
class SettingsException(Exception):
    '''
        thrown an exception
    '''

    def __init__(self, message, errors=84):            
        # Call the base class constructor with the parameters it needs
        super().__init__(message)
            
        # Now for your custom code...
        self.errors = errors