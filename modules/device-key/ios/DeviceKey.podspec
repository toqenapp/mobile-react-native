Pod::Spec.new do |s|
  s.name             = 'DeviceKey'
  s.version          = '0.7.10'
  s.summary          = 'Native device key module for Toqen.app'
  s.description      = 'Expo native module for generating non-exportable device keys and signing challenges via Secure Enclave or Keychain on iOS.'
  s.author           = 'Toqen.app'
  s.homepage         = 'https://toqen.app'
  s.license          = { :type => 'MIT' }
  s.platforms        = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.source           = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
