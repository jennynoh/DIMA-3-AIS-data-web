package net.kdigital.portservice.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.ToString;

@ToString
public class LoginUserDetails implements UserDetails {
	private static final long serialVersionUID = 1L;
	private String userId;
	private String userPwd;
	private String userName;
	private String userEmail;
	private String userPhone;
	private String company;
	private LocalDateTime joinDate;
	private String userRole;
	private boolean notificationSetting;
	private boolean enabled;

	
	/**
	 * 사용자 권한 반환 
	 * 
	 */
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		Collection<GrantedAuthority> collection = new ArrayList<>();
		collection.add(new GrantedAuthority() {
			private static final long serialVersionUID = 1L;
			
			@Override
			public String getAuthority() {
				return null;
			}
		});
		return collection;
	}

	
	@Override
	public String getPassword() {
		return this.userPwd;
	}

	@Override
	public String getUsername() {
		return this.userId;
	}
	
	// 사용자 이름 반환 
	public String getName() {
		return this.userName;
	}

	@Override
	public boolean isAccountNonExpired() {
		return this.enabled;
	}

	@Override
	public boolean isAccountNonLocked() {
		return this.enabled;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@Override
	public boolean isEnabled() {
		return this.enabled;
	}

	public LoginUserDetails(String userId, String userPwd, String userEmail, String userPhone, String company,
			LocalDateTime joinDate, String userRole, boolean notificationSetting, boolean enabled) {
		super();
		this.userId = userId;
		this.userPwd = userPwd;
		this.userEmail = userEmail;
		this.userPhone = userPhone;
		this.company = company;
		this.joinDate = joinDate;
		this.userRole = userRole;
		this.notificationSetting = notificationSetting;
		this.enabled = enabled;
	}
	
	public LoginUserDetails(UserDTO userDTO) {
		super();
		this.userId = userDTO.getUserId();
		this.userPwd = userDTO.getUserPwd();
		this.userEmail = userDTO.getUserEmail();
		this.userPhone = userDTO.getUserPhone();
		this.company = userDTO.getCompany();
		this.joinDate = userDTO.getJoinDate();
		this.userRole = userDTO.getUserRole();
		this.notificationSetting = userDTO.isNotificationSetting();
		this.enabled = userDTO.isEnabled();
	}

}
